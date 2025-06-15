const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Admission = require('../models/admissionModel');
const Student = require('../models/studentModel');
const EmailService = require('../../../services/emailService');
const { uploadToStorage } = require('../../../utils/fileUpload');
const { generateEnrollmentNumber } = require('../../../utils/studentUtils');

exports.submitAdmission = catchAsync(async (req, res) => {
    const {
        studentDetails,
        parentDetails,
        status = 'pending',
        submittedAt = new Date()
    } = req.body;

    const applicationId = `ADM${new Date().getFullYear()}${Math.random().toString().substr(2, 6)}`;

    const admission = await Admission.create({
        applicationId,
        studentDetails,
        parentDetails,
        status,
        submittedAt,
        documents: req.files ? req.files.map(file => ({
            name: file.originalname,
            url: file.path,
            type: file.mimetype
        })) : []
    });

    // Send confirmation email
    await EmailService.sendAdmissionConfirmation(
        studentDetails.email,
        {
            applicationId,
            studentName: studentDetails.name,
            classApplied: studentDetails.classLevel
        }
    );

    res.status(201).json(ApiResponse.success('Application submitted successfully', {
        applicationId: admission.applicationId
    }));
});

exports.uploadDocuments = catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('No files uploaded'));
    }

    const uploadedFiles = await Promise.all(
        req.files.map(file => uploadToStorage(file, 'admissions'))
    );

    res.json(ApiResponse.success('Documents uploaded successfully', {
        documents: uploadedFiles
    }));
});

exports.getAdmissionRequests = catchAsync(async (req, res) => {
    const { status = 'pending', page = 1, limit = 10, search } = req.query;

    let query = { status };
    if (search) {
        query.$or = [
            { 'studentDetails.name': { $regex: search, $options: 'i' } },
            { applicationId: { $regex: search, $options: 'i' } }
        ];
    }

    const [requests, total] = await Promise.all([
        Admission.find(query)
            .populate('studentDetails.classId')
            .sort({ submittedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Admission.countDocuments(query)
    ]);

    res.json(ApiResponse.success('Admission requests retrieved successfully', {
        requests,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    }));
});

exports.getAdmissionDetails = catchAsync(async (req, res) => {
    const { id } = req.params;

    const admission = await Admission.findById(id)
        .populate('studentDetails.classId')
        .populate('processedBy', 'name email');

    if (!admission) {
        return res.status(404).json(ApiResponse.error('Admission application not found'));
    }

    res.json(ApiResponse.success('Admission details retrieved successfully', admission));
});

exports.updateAdmissionStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const admission = await Admission.findByIdAndUpdate(
        id,
        {
            status,
            remarks,
            updatedAt: new Date(),
            processedBy: req.user._id
        },
        { new: true }
    ).populate('studentDetails.classId');

    if (!admission) {
        return res.status(404).json(ApiResponse.error('Admission application not found'));
    }

    if (status === 'approved') {
        const enrollmentNumber = await generateEnrollmentNumber();
        const student = await Student.create({
            enrollmentNumber,
            ...admission.studentDetails,
            admissionId: admission._id,
            status: 'active'
        });

        // Send acceptance email
        await EmailService.sendAdmissionStatus(
            admission.studentDetails.email,
            {
                status: 'approved',
                studentName: admission.studentDetails.name,
                enrollmentNumber,
                classAssigned: admission.studentDetails.classLevel
            }
        );
    } else if (status === 'rejected') {
        // Send rejection email
        await EmailService.sendAdmissionStatus(
            admission.studentDetails.email,
            {
                status: 'rejected',
                studentName: admission.studentDetails.name,
                remarks
            }
        );
    }

    res.json(ApiResponse.success('Admission status updated successfully', admission));
});

exports.bulkUpdateAdmissions = catchAsync(async (req, res) => {
    const { applicationIds, status, remarks } = req.body;

    const admissions = await Admission.find({ _id: { $in: applicationIds } });

    await Promise.all(admissions.map(async (admission) => {
        admission.status = status;
        admission.remarks = remarks;
        admission.updatedAt = new Date();
        admission.processedBy = req.user._id;
        await admission.save();

        if (status === 'approved') {
            const enrollmentNumber = await generateEnrollmentNumber();
            await Student.create({
                enrollmentNumber,
                ...admission.studentDetails,
                admissionId: admission._id,
                status: 'active'
            });

            await EmailService.sendAdmissionStatus(
                admission.studentDetails.email,
                {
                    status: 'approved',
                    studentName: admission.studentDetails.name,
                    enrollmentNumber,
                    classAssigned: admission.studentDetails.classLevel
                }
            );
        } else if (status === 'rejected') {
            await EmailService.sendAdmissionStatus(
                admission.studentDetails.email,
                {
                    status: 'rejected',
                    studentName: admission.studentDetails.name,
                    remarks
                }
            );
        }
    }));

    res.json(ApiResponse.success('Bulk update completed successfully', {
        updatedCount: applicationIds.length
    }));
});

exports.getAdmissionStats = catchAsync(async (req, res) => {
    const stats = await Admission.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const formattedStats = stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
    }, {});

    res.json(ApiResponse.success('Admission statistics retrieved successfully', formattedStats));
});

module.exports = exports;