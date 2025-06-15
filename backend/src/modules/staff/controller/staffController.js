const mongoose = require('mongoose');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Staff = require('../models/staffModel');
const StaffAttendance = require('../models/staffAttendanceModel');
const StaffLeave = require('../models/leaveModel');
const TransportRoute = require('../models/transportModel');
const Teacher = require('../../teacher/models/teacherModel');
const { uploadToCloud } = require('../../../utils/fileUpload');
const Report = require('../models/reportModel');
const mockRoutes = require('../data/mockTransportRoutes');

const staffController = {
    getDashboardStats: catchAsync(async (req, res) => {
        try {
            const totalStaff = await Staff.countDocuments({ isActive: true });
            const totalTeachers = await Teacher.countDocuments({ isActive: true });
            const departments = await Teacher.distinct('department');
            const pendingLeaves = await StaffLeave.countDocuments({ status: 'pending' });
            
            const recentTeachers = await Teacher.find({ isActive: true })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('name updatedAt');

            const stats = {
                totalStaff: totalStaff || 0,
                totalTeachers: totalTeachers || 0,
                activeDepartments: departments.length || 0,
                pendingRequests: pendingLeaves || 0,
                recentActivity: recentTeachers || []
            };

            res.json(ApiResponse.success('Dashboard stats retrieved successfully', stats));
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            res.json(ApiResponse.error('Failed to retrieve dashboard stats'));
        }
    }),

    getAllStaff: catchAsync(async (req, res) => {
        const { search = '' } = req.query;
        
        let query = { isActive: true };
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { staffID: new RegExp(search, 'i') },
                { department: new RegExp(search, 'i') }
            ];
        }

        // Get staff and teachers
        const staff = await Staff.find(query).select('-__v').sort({ createdAt: -1 });
        const teachers = await Teacher.find(query).select('-__v').sort({ createdAt: -1 });

        const transformedStaff = [...staff, ...teachers].map(member => ({
            _id: member._id,
            staffID: member.staffID || `ST${member._id.toString().substring(0, 6)}`,
            name: member.name,
            department: member.department,
            designation: member.designation || 'Teacher',
            contact: member.contact || member.mobileNo,
            email: member.email,
            isActive: member.isActive !== false,
            role: member.role || member.designation || 'Staff'
        }));

        res.json(ApiResponse.success('Staff list retrieved successfully', transformedStaff));
    }),

    getStaffById: catchAsync(async (req, res) => {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json(ApiResponse.error('Staff not found'));
        }
        res.json(ApiResponse.success('Staff retrieved successfully', staff));
    }),

    createStaff: catchAsync(async (req, res) => {
        const staff = await Staff.create(req.body);
        res.status(201).json(ApiResponse.success('Staff created successfully', staff));
    }),

    updateStaff: catchAsync(async (req, res) => {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!staff) {
            return res.status(404).json(ApiResponse.error('Staff not found'));
        }

        res.json(ApiResponse.success('Staff updated successfully', staff));
    }),

    deleteStaff: catchAsync(async (req, res) => {
        const staff = await Staff.findByIdAndUpdate(req.params.id, 
            { isActive: false },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json(ApiResponse.error('Staff not found'));
        }

        res.json(ApiResponse.success('Staff deleted successfully'));
    }),

    markAttendance: catchAsync(async (req, res) => {
        const { department, date, attendanceRecords } = req.body;

        if (!department || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json(
                ApiResponse.error('Invalid request data')
            );
        }

        try {
            const attendanceDate = new Date(date);
            attendanceDate.setHours(0, 0, 0, 0);
            const recordedBy = req.user?._id || new mongoose.Types.ObjectId();

            // Delete existing attendance records for this date and department
            await StaffAttendance.deleteMany({
                date: attendanceDate,
                department: department
            });

            // Create new attendance records
            const records = attendanceRecords.map(record => ({
                staffId: new mongoose.Types.ObjectId(record.staffId),
                date: attendanceDate,
                status: record.status,
                department: department,
                staffModel: 'Staff',
                recordedBy: recordedBy
            }));

            const savedRecords = await StaffAttendance.insertMany(records);

            // Calculate statistics
            const stats = {
                date: attendanceDate,
                department: department,
                recordsCount: savedRecords.length,
                present: savedRecords.filter(r => r.status === 'present').length,
                absent: savedRecords.filter(r => r.status === 'absent').length,
                late: savedRecords.filter(r => r.status === 'late').length
            };

            res.json(ApiResponse.success('Attendance marked successfully', stats));

        } catch (error) {
            console.error('Error marking attendance:', error);
            res.status(500).json(
                ApiResponse.error('Failed to mark attendance: ' + error.message)
            );
        }
    }),

    getAttendanceReport: catchAsync(async (req, res) => {
        const report = {
            present: 0,
            absent: 0,
            late: 0,
            total: 0
        };

        res.json(ApiResponse.success('Attendance report retrieved successfully', report));
    }),

    generateAttendanceReport: async (req, res) => {
        try {
            res.json({ success: true, message: "Attendance report generated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error generating attendance report", error });
        }
    },

    getAttendanceStatistics: catchAsync(async (req, res) => {
        const { department } = req.query;
        
        // Get local date start and end
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        const query = {
            date: { 
                $gte: startOfDay,
                $lte: endOfDay
            },
            ...(department && { department })
        };

        console.log('Statistics query:', JSON.stringify(query, null, 2));

        try {
            // First, get total staff count for the department
            const [staff, teachers] = await Promise.all([
                Staff.countDocuments({ 'professionalInfo.department': department, isActive: true }),
                Teacher.countDocuments({ department, isActive: true })
            ]);

            const totalStaffInDepartment = staff + teachers;

            // Get attendance stats
            const stats = await StaffAttendance.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        present: { 
                            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                        },
                        absent: { 
                            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                        },
                        late: { 
                            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                        }
                    }
                }
            ]);

            console.log('Raw attendance stats:', stats);

            const result = stats.length > 0 ? stats[0] : { present: 0, absent: 0, late: 0 };
            const markedTotal = result.present + result.absent + result.late;

            const statistics = {
                presentPercentage: Math.round((result.present / totalStaffInDepartment) * 100) || 0,
                absentPercentage: Math.round((result.absent / totalStaffInDepartment) * 100) || 0,
                latePercentage: Math.round((result.late / totalStaffInDepartment) * 100) || 0,
                totalStaff: totalStaffInDepartment,
                rawCounts: {
                    present: result.present,
                    absent: result.absent,
                    late: result.late,
                    total: markedTotal,
                    totalStaff: totalStaffInDepartment
                }
            };

            console.log('Calculated statistics:', statistics);

            res.json(ApiResponse.success('Attendance statistics retrieved successfully', statistics));
        } catch (error) {
            console.error('Error calculating statistics:', error);
            res.status(500).json(
                ApiResponse.error('Failed to fetch attendance statistics: ' + error.message)
            );
        }
    }),

    getStaffByDepartment: catchAsync(async (req, res) => {
        const { department } = req.params;
        
        const [staff, teachers] = await Promise.all([
            Staff.find({ 'professionalInfo.department': department, isActive: true }).select('-__v'),
            Teacher.find({ department, isActive: true }).select('-__v')
        ]);

        const combinedStaff = [...staff, ...teachers].map(member => ({
            _id: member._id.toString(), // Ensure ID is a string
            staffID: member.staffID || `ST${member._id.toString().substring(0, 6)}`,
            name: member.name || `${member.firstName} ${member.lastName}`,
            department: member.department || member.professionalInfo?.department,
            designation: member.designation || 'Teacher',
            isActive: member.isActive !== false
        }));

        res.json(ApiResponse.success('Staff list retrieved successfully', combinedStaff));
    }),

    bulkUploadAttendance: catchAsync(async (req, res) => {
        try {
            if (!req.files || !req.files.attendanceFile) {
                return res.status(400).json(
                    ApiResponse.error('No file uploaded')
                );
            }

            const file = req.files.attendanceFile;

            res.json(ApiResponse.success('Bulk attendance uploaded successfully'));
        } catch (error) {
            console.error('Error in bulk upload:', error);
            res.status(500).json(
                ApiResponse.error('Failed to process bulk attendance upload')
            );
        }
    }),

    applyLeave: catchAsync(async (req, res) => {
        const { staffId, leaveType, startDate, endDate, reason } = req.body;

        const leaveBalance = await checkLeaveBalance(staffId, leaveType);
        if (!leaveBalance.hasBalance) {
            return res
                .status(400)
                .json(ApiResponse.error('Insufficient leave balance'));
        }

        const overlappingLeave = await StaffLeave.findOne({
            staffId,
            status: { $in: ['pending', 'approved'] },
            $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
        });

        if (overlappingLeave) {
            return res
                .status(400)
                .json(ApiResponse.error('Leave dates overlap with existing leave'));
        }

        const leave = await StaffLeave.create({
            staffId,
            leaveType,
            startDate,
            endDate,
            reason,
            documents: req.files?.map((file) => ({
                fileName: file.originalname,
                fileUrl: file.path,
            })),
        });

        res.json(
            ApiResponse.success('Leave application submitted successfully', leave)
        );
    }),

    processLeave: catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status, remarks } = req.body;

        const leave = await StaffLeave.findById(id);
        if (!leave) {
            return res.status(404).json(ApiResponse.error('Leave application not found'));
        }

        leave.status = status;
        leave.remarks = remarks;
        leave.processedAt = new Date();
        leave.processedBy = req.user._id;

        await leave.save();

        res.json(ApiResponse.success('Leave processed successfully', leave));
    }),

    getDepartments: catchAsync(async (req, res) => {
        try {
            // Use the departments array from your seed data
            const departments = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education'];
            
            // For debugging
            console.log('Fetching departments:', departments);
            
            return res.status(200).json({
                success: true,
                message: 'Departments retrieved successfully',
                data: departments
            });
        } catch (error) {
            console.error('Error in getDepartments:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch departments',
                error: error.message
            });
        }
    }),

    handleBiometricScan: catchAsync(async (req, res) => {
        try {
            // Mock biometric scan data
            const mockBiometricData = {
                deviceId: 'BIO-001',
                timestamp: new Date(),
                success: true,
                confidence: 98.5,
                staffDetails: {
                    staffId: req.user?._id || 'UNKNOWN',
                    scanType: 'fingerprint',
                    location: 'Main Entrance'
                }
            };

            // In a real implementation, you would:
            // 1. Connect to biometric device
            // 2. Get scan data
            // 3. Process and validate the scan
            // 4. Return the results

            res.json(ApiResponse.success('Biometric scan completed', mockBiometricData));
        } catch (error) {
            console.error('Biometric scan error:', error);
            res.status(500).json(
                ApiResponse.error('Biometric scan failed: ' + error.message)
            );
        }
    }),

    getLeaveRequests: catchAsync(async (req, res) => {
        try {
            const { status, staffId } = req.query;
            let query = {};

            if (status) {
                query.status = status;
            }
            if (staffId) {
                query.staffId = staffId;
            }

            const leaveRequests = await StaffLeave.find(query)
                .populate('staffId', 'name staffID department')
                .sort({ createdAt: -1 });

            return res.json(ApiResponse.success('Leave requests retrieved successfully', leaveRequests));
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch leave requests')
            );
        }
    }),

    getLeaveBalance: catchAsync(async (req, res) => {
        try {
            const { staffId } = req.query;
            if (!staffId) {
                return res.status(400).json(
                    ApiResponse.error('Staff ID is required')
                );
            }

            // Mock leave balance data - replace with actual database query
            const leaveBalance = {
                casual: {
                    total: 12,
                    used: 5,
                    remaining: 7
                },
                sick: {
                    total: 15,
                    used: 3,
                    remaining: 12
                },
                earned: {
                    total: 30,
                    used: 10,
                    remaining: 20
                }
            };

            return res.json(ApiResponse.success('Leave balance retrieved successfully', leaveBalance));
        } catch (error) {
            console.error('Error fetching leave balance:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch leave balance')
            );
        }
    }),

    applyLeave: catchAsync(async (req, res) => {
        const { staffId, leaveType, startDate, endDate, reason } = req.body;

        if (!staffId || !leaveType || !startDate || !endDate) {
            return res.status(400).json(
                ApiResponse.error('Missing required fields')
            );
        }

        try {
            const leave = await StaffLeave.create({
                staffId,
                leaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                status: 'pending',
                attachments: req.files?.map(file => ({
                    name: file.originalname,
                    path: file.path
                }))
            });

            return res.status(201).json(
                ApiResponse.success('Leave application submitted successfully', leave)
            );
        } catch (error) {
            console.error('Error applying for leave:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to submit leave application')
            );
        }
    }),

    processLeave: catchAsync(async (req, res) => {
        const { id } = req.params;
        const { status, remarks } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json(
                ApiResponse.error('Invalid status')
            );
        }

        try {
            const leave = await StaffLeave.findByIdAndUpdate(
                id,
                {
                    status,
                    remarks,
                    processedAt: new Date(),
                    processedBy: req.user._id
                },
                { new: true }
            );

            if (!leave) {
                return res.status(404).json(
                    ApiResponse.error('Leave request not found')
                );
            }

            return res.json(
                ApiResponse.success('Leave request processed successfully', leave)
            );
        } catch (error) {
            console.error('Error processing leave:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to process leave request')
            );
        }
    }),

    getLeaveHistory: catchAsync(async (req, res) => {
        try {
            const { staffId } = req.query;
            const filter = staffId ? { staffId } : {};

            const leaveHistory = await StaffLeave.find(filter)
                .populate('staffId', 'name staffID department')
                .populate('processedBy', 'name')
                .sort({ createdAt: -1 });

            return res.json(
                ApiResponse.success('Leave history retrieved successfully', leaveHistory)
            );
        } catch (error) {
            console.error('Error fetching leave history:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch leave history')
            );
        }
    }),

    generateReport: async (req, res) => {
        try {
            const { type, period } = req.query;
            console.log('Generating report:', { type, period });

            // Validate input
            if (!type || !period) {
                return res.status(400).json({
                    success: false,
                    message: 'Report type and period are required'
                });
            }

            const dateRange = getDateRange(period);
            let reportData = null;
            let summary = {
                totalStaff: 0,
                present: 0,
                absent: 0,
                late: 0
            };
            
            // Get total staff count
            const totalStaff = await Staff.countDocuments({ isActive: true });
            summary.totalStaff = totalStaff;

            switch (type) {
                case 'attendance':
                    const attendanceStats = await StaffAttendance.aggregate([
                        {
                            $match: {
                                date: {
                                    $gte: dateRange.startDate,
                                    $lte: dateRange.endDate
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                present: {
                                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                                },
                                absent: {
                                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                                },
                                late: {
                                    $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                                }
                            }
                        }
                    ]);

                    if (attendanceStats.length > 0) {
                        summary = {
                            ...summary,
                            ...attendanceStats[0]
                        };
                    }

                    reportData = {
                        stats: summary,
                        dateRange: {
                            start: dateRange.startDate,
                            end: dateRange.endDate
                        }
                    };
                    break;

                // Add other report types here
                default:
                    throw new Error(`Unsupported report type: ${type}`);
            }

            // Create report document
            const report = await Report.create({
                name: `${type}_report_${period}_${Date.now()}`,
                type,
                period,
                data: reportData,
                status: 'completed',
                generatedBy: req.user?._id,
                summary,
                generatedDate: new Date()
            });

            return res.json({
                success: true,
                message: 'Report generated successfully',
                data: [report]
            });

        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate report',
                error: error.message
            });
        }
    },

    downloadReport: async (req, res) => {
        try {
            const { reportId } = req.params;
            const { format } = req.query;

            console.log('Downloading report:', { reportId, format }); // Debug log

            if (!reportId || !mongoose.Types.ObjectId.isValid(reportId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report ID'
                });
            }

            const report = await Report.findById(reportId);
            
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found'
                });
            }

            // Format the report data
            const formattedReport = {
                ...report.toObject(),
                downloadedAt: new Date(),
                format
            };

            // Send formatted report
            return res.json({
                success: true,
                message: 'Report downloaded successfully',
                data: formattedReport
            });
        } catch (error) {
            console.error('Error downloading report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to download report',
                error: error.message
            });
        }
    },

    shareReport: async (req, res) => {
        try {
            const { id } = req.params;
            const { recipients } = req.body;

            // Add report sharing logic here
            res.json(ApiResponse.success('Report shared successfully'));
        } catch (error) {
            console.error('Error sharing report:', error);
            res.status(500).json(
                ApiResponse.error('Failed to share report')
            );
        }
    },

    getReports: async (req, res) => {
        try {
            const { type, period } = req.query;
            console.log('Generating report:', { type, period }); // Debug log

            // Get date range
            const { startDate, endDate } = getDateRange(period);
            console.log('Date range:', { startDate, endDate }); // Debug log

            let reportData = [];
            
            switch (type) {
                case 'attendance':
                    // Mock attendance report data for testing
                    reportData = [{
                        id: new mongoose.Types.ObjectId(),
                        name: `Attendance Report - ${period}`,
                        generatedDate: new Date(),
                        type: 'attendance',
                        status: 'completed',
                        periodStart: startDate,
                        periodEnd: endDate,
                        summary: {
                            totalStaff: 50,
                            present: 45,
                            absent: 3,
                            late: 2
                        }
                    }];
                    break;

                case 'performance':
                    // Add performance report logic
                    break;

                case 'leave':
                    // Add leave report logic
                    break;

                case 'payroll':
                    // Add payroll report logic
                    break;

                default:
                    throw new Error('Invalid report type');
            }

            return res.json({
                success: true,
                message: 'Reports retrieved successfully',
                data: reportData
            });

        } catch (error) {
            console.error('Error generating report:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate report',
                error: error.message
            });
        }
    },

    getTransportRoutes: async (req, res) => {
        try {
            console.log('getTransportRoutes handler called');
            
            // Return mock data for testing
            return res.status(200).json({
                success: true,
                message: 'Transport routes retrieved successfully',
                data: [{
                    id: '1',
                    name: 'Test Route',
                    description: 'Test Description',
                    stops: []
                }]
            });
        } catch (error) {
            console.error('Transport routes error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transport routes',
                error: error.message
            });
        }
    },

    getRouteStops: async (req, res) => {
        try {
            const { routeId } = req.params;
            console.log('Getting stops for route:', routeId);
            
            // Find route from mock data
            const route = mockRoutes[0]; // For testing, return first route's stops
            
            return res.status(200).json({
                success: true,
                message: 'Route stops retrieved successfully',
                data: route.stops
            });
        } catch (error) {
            console.error('Error in getRouteStops:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch route stops',
                error: error.message
            });
        }
    },

    getBusLocation: async (req, res) => {
        try {
            const { routeId } = req.params;
            const location = await TransportRoute.findById(routeId)
                .select('currentLocation lastUpdated');

            return res.json({
                success: true,
                message: 'Bus location retrieved successfully',
                data: location
            });
        } catch (error) {
            console.error('Error fetching bus location:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch bus location',
                error: error.message
            });
        }
    },

    updateBusLocation: async (req, res) => {
        try {
            const { routeId } = req.params;
            const { latitude, longitude } = req.body;

            const updatedRoute = await TransportRoute.findByIdAndUpdate(
                routeId,
                {
                    currentLocation: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    lastUpdated: new Date()
                },
                { new: true }
            );

            // Emit location update through WebSocket
            req.app.get('io').emit('busLocationUpdate', {
                routeId,
                latitude,
                longitude,
                lastUpdated: new Date()
            });

            return res.json({
                success: true,
                message: 'Bus location updated successfully',
                data: updatedRoute
            });
        } catch (error) {
            console.error('Error updating bus location:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update bus location',
                error: error.message
            });
        }
    },
};

// Helper function to get date range
const getDateRange = (period) => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
        case 'current':
            startDate.setDate(1);
            break;
        case 'previous':
            startDate.setMonth(startDate.getMonth() - 1, 1);
            endDate.setDate(0);
            break;
        case 'yearly':
            startDate.setMonth(0, 1);
            break;
        default:
            startDate.setDate(1);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

module.exports = staffController;
