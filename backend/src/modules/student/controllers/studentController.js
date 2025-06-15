const mongoose = require('mongoose');
const Student = require('../models/studentModel');
const Class = require('../../academic/models/classModel');
const Section = require('../../academic/models/sectionModel');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const { uploadToStorage } = require('../../../utils/fileUpload');
const ExcelJS = require('exceljs');

// Get all students with filtering, sorting, and pagination
exports.getAllStudents = async (req, res) => {
    try {
        const {
            search,
            classId,    // Changed to match frontend parameter name
            sectionId,  // Changed to match frontend parameter name
            status = 'active',
            page = 1,
            limit = 10
        } = req.query;

        console.log('Raw query params:', req.query); // Log raw query params
        console.log('Parsed query params:', { search, classId, sectionId, status });

        let query = {};

        // Class filter
        if (classId) {
            try {
                query['academicInfo.class'] = new mongoose.Types.ObjectId(classId);
                console.log('Added class filter:', classId);
            } catch (error) {
                console.error('Invalid class ID:', classId);
            }
        }

        // Section filter
        if (sectionId) {
            try {
                query['academicInfo.section'] = new mongoose.Types.ObjectId(sectionId);
                console.log('Added section filter:', sectionId);
            } catch (error) {
                console.error('Invalid section ID:', sectionId);
            }
        }

        // Status filter
        if (status !== 'all') {
            query.isActive = status === 'active';
        }

        console.log('Final query:', JSON.stringify(query, null, 2));

        const students = await Student.find(query)
            .select('-__v')
            .populate('academicInfo.class', 'name level')
            .populate('academicInfo.section', 'name')
            .sort({ 'personalInfo.firstName': 1 })
            .lean();

        console.log(`Found ${students.length} students`);

        return res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    total: students.length,
                    page: Number(page),
                    pages: Math.ceil(students.length / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get Students Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching student with ID:', id); // Debug log
    
        const student = await Student.findById(id)
          .populate('academicInfo.class', 'name level')
          .populate('academicInfo.section', 'name')
          .lean();
    
        console.log('Found student:', student); // Debug log
    
        if (!student) {
          return res.status(404).json({
            success: false,
            message: 'Student not found'
          });
        }
    
        return res.status(200).json({
          success: true,
          data: student
        });
      } catch (error) {
        console.error('Error in getStudentById:', error);
        return res.status(500).json({
          success: false,
          message: 'Error fetching student',
          error: error.message
        });
      }
    };

// Create a new student
exports.createStudent = catchAsync(async (req, res) => {
    const studentData = req.body;

    if (req.file) {
        studentData.photo = await uploadToStorage(req.file, 'students');
    }

    const student = await Student.create(studentData);

    res.status(201).json(ApiResponse.success('Student created successfully', student));
});

// Update an existing student
exports.updateStudent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
        updateData.photo = await uploadToStorage(req.file, 'students');
    }

    const student = await Student.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    ).select('-password');

    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    res.json(ApiResponse.success('Student updated successfully', student));
});

// "Delete" a student (set status to inactive)
exports.deleteStudent = catchAsync(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
        id,
        { status: 'inactive' },
        { new: true }
    );

    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    res.json(ApiResponse.success('Student deleted successfully'));
});

// Process student admission (placeholder implementation)
exports.processAdmission = catchAsync(async (req, res) => {
    // Expecting student ID and admission details in req.body
    const { id, admissionStatus } = req.body;

    const student = await Student.findByIdAndUpdate(
        id,
        { admissionStatus, admittedAt: new Date() },
        { new: true }
    );

    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    res.json(ApiResponse.success('Student admission processed successfully', student));
});

// Promote students from one class/section to another
exports.promoteStudents = catchAsync(async (req, res) => {
    const { 
        fromClass, 
        fromSection, 
        toClass, 
        toSection, 
        students 
    } = req.body;

    await Student.updateMany(
        { _id: { $in: students } },
        {
            $set: {
                class: toClass,
                section: toSection,
                promotedAt: new Date(),
                promotedBy: req.user._id
            },
            $push: {
                promotionHistory: {
                    fromClass,
                    fromSection,
                    toClass,
                    toSection,
                    date: new Date(),
                    promotedBy: req.user._id
                }
            }
        }
    );

    res.json(ApiResponse.success('Students promoted successfully'));
});

// Bulk import students via an Excel file
exports.bulkImportStudents = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    const students = [];
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            try {
                const student = {
                    name: row.getCell(1).value,
                    rollNo: row.getCell(2).value,
                    class: row.getCell(3).value,
                    section: row.getCell(4).value,
                    dateOfBirth: row.getCell(5).value,
                    gender: row.getCell(6).value,
                    parentInfo: {
                        fatherName: row.getCell(7).value,
                        motherName: row.getCell(8).value,
                        email: row.getCell(9).value,
                        phone: row.getCell(10).value
                    }
                };

                students.push(student);
            } catch (error) {
                errors.push(`Row ${rowNumber}: ${error.message}`);
            }
        }
    });

    if (errors.length > 0) {
        return res.status(400).json(ApiResponse.error('Validation errors', { errors }));
    }

    await Student.insertMany(students);

    res.json(ApiResponse.success('Students imported successfully', {
        imported: students.length
    }));
});

// Export students as an Excel file
exports.exportStudents = catchAsync(async (req, res) => {
    const { classId, sectionId } = req.query;

    const query = {};
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;

    const students = await Student.find(query)
        .populate('class', 'name')
        .populate('section', 'name');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Roll No', key: 'rollNo', width: 15 },
        { header: 'Class', key: 'className', width: 10 },
        { header: 'Section', key: 'sectionName', width: 10 },
        { header: 'Father Name', key: 'fatherName', width: 20 },
        { header: 'Mother Name', key: 'motherName', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 }
    ];

    students.forEach(student => {
        worksheet.addRow({
            name: student.name,
            rollNo: student.rollNo,
            className: student.class?.name,
            sectionName: student.section?.name,
            fatherName: student.parentInfo?.fatherName,
            motherName: student.parentInfo?.motherName,
            email: student.parentInfo?.email,
            phone: student.parentInfo?.phone
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

    await workbook.xlsx.write(res);
});

// Get student attendance (placeholder implementation)
exports.getAttendance = catchAsync(async (req, res) => {
    // Placeholder: Replace with your logic to retrieve attendance records.
    const attendanceRecords = []; // e.g., fetch from an Attendance model
    res.json(ApiResponse.success('Student attendance retrieved successfully', attendanceRecords));
});

// Mark student attendance (placeholder implementation)
exports.markAttendance = catchAsync(async (req, res) => {
    // Placeholder: Replace with your logic to mark attendance.
    // For example, you might expect student ID, date, and status in req.body.
    const { id, date, status } = req.body;
    res.json(ApiResponse.success('Student attendance marked successfully', { id, date, status }));
});

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalStudents,
            activeStudents,
            sectionCount,
            recentActivityLogs
        ] = await Promise.all([
            Student.countDocuments(),
            Student.countDocuments({ isActive: true }),
            Section.countDocuments(),
            // Add your activity log model query here
            []
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                activeStudents,
                sections: sectionCount,
                recentActivity: recentActivityLogs
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

exports.bulkUpdateStudents = async (req, res) => {
  try {
    const { filters, fieldsToUpdate, updates } = req.body;

    if (!fieldsToUpdate || fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields specified for update'
      });
    }

    // Construct update object based on selected fields
    const updateObj = {};
    fieldsToUpdate.forEach(field => {
      if (updates[field] !== undefined) {
        updateObj[field] = updates[field];
      }
    });

    // Perform bulk update
    const result = await Student.updateMany(
      filters,
      { $set: updateObj },
      { multi: true }
    );

    res.json({
      success: true,
      message: 'Bulk update successful',
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update',
      error: error.message
    });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    let { query } = req.query;
    
    // Debug logging
    console.log('Search endpoint hit with query:', query);
    console.log('Full request query:', req.query);
    
    // Clean the query
    query = query?.trim().replace(/\uFEFF/g, '') || '';
    
    console.log('Cleaned query:', query);

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Create a regex for case-insensitive search with escaped special characters
    const searchRegex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
    
    console.log('Search regex:', searchRegex);

    // Build search criteria
    const searchCriteria = {
      $or: [
        { enrollmentNumber: searchRegex },
        { 'personalInfo.firstName': searchRegex },
        { 'personalInfo.lastName': searchRegex },
        { 'academicInfo.rollNumber': searchRegex }
      ]
    };

    console.log('Search criteria:', JSON.stringify(searchCriteria, null, 2));

    const students = await Student.find(searchCriteria)
      .populate({
        path: 'academicInfo.class',
        select: 'name'
      })
      .populate({
        path: 'academicInfo.section',
        select: 'name'
      })
      .limit(10)
      .lean();

    console.log(`Found ${students.length} matching students`);

    // Debug: log first result if any
    if (students.length > 0) {
      console.log('First match:', JSON.stringify(students[0], null, 2));
    }

    return res.status(200).json({
      success: true,
      data: {
        students,
        total: students.length
      }
    });

  } catch (error) {
    console.error('Search error details:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    
    return res.status(500).json({
      success: false,
      message: 'Error searching students',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getPromotionEligibleStudents = async (req, res) => {
  try {
    console.log('Fetching promotion eligible students...');

    // First, log the total number of students
    const totalCount = await Student.countDocuments();
    console.log('Total students in database:', totalCount);

    // Build the query with looser criteria first
    const query = {
      isActive: true,
      'academicInfo.class': { $exists: true }
    };

    console.log('Using query:', JSON.stringify(query, null, 2));

    const students = await Student.find(query)
      .select([
        'personalInfo.firstName',
        'personalInfo.lastName',
        'academicInfo.class',
        'academicInfo.section',
        'academicInfo.rollNumber',
        'academicInfo.admissionNumber',
        'isActive'
      ])
      .populate('academicInfo.class', 'name')
      .populate('academicInfo.section', 'name')
      .lean();

    console.log(`Found ${students.length} students before transformation`);

    // Transform data for frontend with additional error handling
    const transformedStudents = students.map(student => {
      try {
        const studentData = {
          id: student._id.toString(),
          name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim() || 'N/A',
          currentClass: student.academicInfo?.class?.name || 'N/A',
          currentSection: student.academicInfo?.section?.name || 'N/A',
          rollNumber: student.academicInfo?.rollNumber || 'N/A',
          admissionNumber: student.academicInfo?.admissionNumber || 'N/A'
        };

        // Log the transformed student data
        console.log('Transformed student:', studentData);

        return studentData;
      } catch (error) {
        console.error('Error transforming student:', student._id, error);
        // Return a minimal valid object if transformation fails
        return {
          id: student._id.toString(),
          name: 'Error in student data',
          currentClass: 'N/A',
          currentSection: 'N/A',
          rollNumber: 'N/A'
        };
      }
    });

    console.log(`Returning ${transformedStudents.length} transformed students`);

    return res.status(200).json({
      success: true,
      students: transformedStudents,
      meta: {
        total: transformedStudents.length,
        originalCount: students.length
      }
    });

  } catch (error) {
    console.error('Error in getPromotionEligibleStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching promotion-eligible students',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = exports;
