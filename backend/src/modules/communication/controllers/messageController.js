const Message = require('../models/Message');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Student = require('../../student/models/studentModel');
const Parent = require('../../parent/models/parentModel');
const Teacher = require('../../teacher/models/teacherModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Update User model import
const User = mongoose.model('User');

const messageController = {
  getMessages: catchAsync(async (req, res) => {
    const { type, role, status, search, startDate, endDate } = req.query;
    const userId = req.user._id;

    if (!type) {
      return res.status(400).json(ApiResponse.error('Message type is required'));
    }

    let query = {
      'recipients.id': userId
    };

    // Add type filter
    if (type !== 'all') {
      query.type = type;
    }

    // Add role filter if not 'all'
    if (role && role !== 'all') {
      query['sender.role'] = role;
    }

    // Add status filters
    if (status && status !== 'all') {
      switch (status) {
        case 'unread':
          query['recipients.$[recipient].read'] = false;
          break;
        case 'read':
          query['recipients.$[recipient].read'] = true;
          break;
        case 'starred':
          query.starred = true;
          break;
        case 'archived':
          query.archived = true;
          break;
      }
    }

    // Add date range if both dates are provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { subject: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { 'sender.name': new RegExp(search, 'i') }
      ];
    }

    try {
      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      return res.json(ApiResponse.success('Messages retrieved successfully', messages));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json(ApiResponse.error('Failed to fetch messages'));
    }
  }),

  getMessageById: catchAsync(async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json(ApiResponse.error('Message not found'));
    }
    res.json(ApiResponse.success('Message retrieved successfully', message));
  }),

  updateMessageStatus: catchAsync(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json(ApiResponse.error('Message not found'));
    }

    switch (action) {
      case 'read':
        const recipient = message.recipients.find(r => r.id.equals(userId));
        if (recipient) {
          recipient.read = true;
          recipient.readAt = new Date();
        }
        break;
      case 'star':
        message.starred = !message.starred;
        break;
      case 'archive':
        message.archived = !message.archived;
        break;
      default:
        return res.status(400).json(ApiResponse.error('Invalid action'));
    }

    await message.save();
    res.json(ApiResponse.success('Message updated successfully', message));
  }),

  deleteMessage: catchAsync(async (req, res) => {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json(ApiResponse.error('Message not found'));
    }
    res.json(ApiResponse.success('Message deleted successfully'));
  }),

  getAttachment: catchAsync(async (req, res) => {
    const { messageId, attachmentId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json(ApiResponse.error('Message not found'));
    }

    const attachment = message.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json(ApiResponse.error('Attachment not found'));
    }

    res.download(attachment.path, attachment.name);
  }),

  getInbox: catchAsync(async (req, res) => {
    const messages = await Message.find({
        recipient: req.user._id,
        archived: false
    })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .lean();

    res.json({
        success: true,
        data: messages
    });
  }),

  getRecipients: catchAsync(async (req, res) => {
    const { type } = req.query;
    console.log('Getting recipients for type:', type);

    try {
        const teacher = await Teacher.findOne({ user: req.user._id })
            .select('classTeacherFor teachingAssignments')
            .populate('classTeacherFor', '_id name');

        if (!teacher) {
            throw new Error('Teacher not found');
        }

        let recipients = [];

        if (type === 'students') {
            // Find all students in the section
            const students = await Student.find({
                'academicInfo.section': teacher.classTeacherFor._id,
                isActive: true
            })
            .populate('user', '_id name')
            .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber user')
            .lean();

            console.log(`Found ${students.length} students`);

            // Create user accounts for students without one
            for (const student of students) {
                if (!student.user) {
                    try {
                        // Create user account
                        const username = `student${student.academicInfo.rollNumber}`;
                        const hashedPassword = await bcrypt.hash(username, 10);

                        const newUser = new User({
                            username,
                            password: hashedPassword,
                            email: `${username}@school.com`,
                            role: 'student',
                            isActive: true
                        });

                        const savedUser = await newUser.save();

                        // Update student with user reference
                        await Student.findByIdAndUpdate(student._id, { user: savedUser._id });
                        student.user = savedUser;
                    } catch (error) {
                        console.error('Error creating user for student:', student._id, error);
                    }
                }
            }

            // Map students to recipients format
            recipients = students
                .filter(student => student.user) // Only include students with user accounts
                .map(student => ({
                    _id: student.user._id,
                    name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
                    detail: `Roll No: ${student.academicInfo?.rollNumber || 'N/A'}`,
                    type: 'student'
                }));
        } 
        else if (type === 'parents') {
            // Find all students in the section first
            const students = await Student.find({
                'academicInfo.section': teacher.classTeacherFor._id,
                isActive: true
            })
            .populate('parent')
            .populate('user', '_id name')
            .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber parent')
            .lean();

            console.log(`Found ${students.length} students with parents`);

            // Create user accounts for parents without one and collect parent data
            const parentData = new Map();

            for (const student of students) {
                if (student.parent && !parentData.has(student.parent._id.toString())) {
                    let parent = student.parent;

                    // Create user account for parent if needed
                    if (!parent.user) {
                        try {
                            const username = `parent${student.academicInfo.rollNumber}`;
                            const hashedPassword = await bcrypt.hash(username, 10);

                            const newUser = new User({
                                username,
                                password: hashedPassword,
                                email: parent.email || `${username}@school.com`,
                                role: 'parent',
                                isActive: true
                            });

                            const savedUser = await newUser.save();
                            await Parent.findByIdAndUpdate(parent._id, { user: savedUser._id });
                            parent.user = savedUser._id;
                        } catch (error) {
                            console.error('Error creating parent user:', error);
                            continue;
                        }
                    }

                    // Add to parent data map
                    parentData.set(parent._id.toString(), {
                        _id: parent.user,
                        name: parent.name || 'Parent',
                        detail: `Parent of ${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`,
                        type: 'parent'
                    });
                }
            }

            recipients = Array.from(parentData.values());
        }
        else if (type === 'admin') {
            // Find all admin users
            const adminUsers = await User.find({
                role: 'admin',
                isActive: true
            })
            .select('_id name email')
            .lean();

            console.log(`Found ${adminUsers.length} admin users`);

            recipients = adminUsers.map(admin => ({
                _id: admin._id,
                name: admin.name || 'Admin User',
                detail: admin.email || 'No email provided',
                type: 'admin'
            }));
        }

        console.log(`Returning ${recipients.length} recipients`);

        return res.json({
            success: true,
            message: 'Recipients retrieved successfully',
            data: recipients
        });

    } catch (error) {
        console.error('Error in getRecipients:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch recipients',
            error: error.message
        });
    }
  }),

  getTeachersForStudent: catchAsync(async (req, res) => {
    try {
      // Find the student with their section
      const student = await Student.findOne({ user: req.user._id })
        .populate('academicInfo.section')
        .lean();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      console.log('Found student:', {
        id: student._id,
        section: student.academicInfo?.section?._id
      });

      // Find all teachers who teach this student's section
      const teachers = await Teacher.find({
        $or: [
          { classTeacherFor: student.academicInfo.section._id },
          { 'teachingAssignments.section': student.academicInfo.section._id }
        ]
      })
      .populate('user', 'name email')
      .lean();

      console.log('Found teachers:', {
        count: teachers.length,
        sectionId: student.academicInfo.section._id
      });

      // Format teachers for response
      const formattedTeachers = teachers.map(teacher => ({
        _id: teacher.user._id, // Use the user ID for messaging
        name: teacher.name,
        email: teacher.email,
        detail: teacher.designation || 'Teacher',
        type: 'teacher',
        isClassTeacher: teacher.classTeacherFor?.equals(student.academicInfo.section._id)
      }));

      return res.json({
        success: true,
        message: 'Teachers retrieved successfully',
        data: formattedTeachers
      });

    } catch (error) {
      console.error('Error in getTeachersForStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch teachers',
        error: error.message
      });
    }
  }),

  getMessages: catchAsync(async (req, res) => {
    const { recipientId } = req.params;
    const userId = req.user._id;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    try {
      // Find messages in both directions
      const messages = await Message.find({
        $or: [
          { sender: userId, 'recipients.id': recipientId },
          { sender: recipientId, 'recipients.id': userId }
        ]
      })
      .sort('-createdAt')
      .populate('sender', 'name')
      .lean();

      // Mark messages as read if student is recipient
      if (req.user.role === 'student') {
        await Message.updateMany(
          {
            sender: recipientId,
            'recipients.id': userId,
            'recipients.read': false
          },
          {
            $set: {
              'recipients.$.read': true,
              'recipients.$.readAt': new Date()
            }
          }
        );
      }

      return res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }
  }),

  sendMessage: catchAsync(async (req, res) => {
    try {
        const { recipientId, content, recipientType, type = 'direct', subject = 'Direct Message' } = req.body;
        console.log('Sending message:', { recipientId, recipientType, subject });

        // Find sender
        const sender = await User.findById(req.user._id);
        if (!sender) {
            throw new Error('Sender not found');
        }

        // Create message document
        const messageData = {
            subject,
            content,
            type,
            sender: sender._id,
            senderType: sender.role || 'teacher',
            recipients: [{
                id: recipientId,
                type: recipientType,
                read: false
            }]
        };

        console.log('Creating message with data:', messageData);

        const message = new Message(messageData);
        await message.save();

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        console.error('Message send error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
}),

  updateMessage: catchAsync(async (req, res) => {
    const { messageId, action } = req.params;
    const updates = {};

    switch(action) {
        case 'read':
            updates.read = true;
            break;
        case 'star':
            updates.starred = true;
            break;
        case 'unstar':
            updates.starred = false;
            break;
        case 'archive':
            updates.archived = true;
            break;
    }

    const message = await Message.findByIdAndUpdate(
        messageId,
        updates,
        { new: true }
    );

    res.json({
        success: true,
        data: message
    });
  }),

  deleteMessage: catchAsync(async (req, res) => {
    await Message.findByIdAndDelete(req.params.messageId);
    
    res.json({
        success: true,
        message: 'Message deleted successfully'
    });
  })
};

module.exports = messageController;
