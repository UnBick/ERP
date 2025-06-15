const StaffAttendance = require('../models/staffAttendanceModel');

const attendanceController = {
    getAllAttendance: async (req, res) => {
        try {
            const attendance = await StaffAttendance.find()
                .populate('staffId', 'name employeeId')
                .sort({ date: -1 });
            res.json({ success: true, data: attendance });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    markAttendance: async (req, res) => {
        try {
            const { staffId, status, date } = req.body;
            const attendance = new StaffAttendance({
                staffId,
                status,
                date: date || new Date(),
                markedBy: req.user._id
            });
            await attendance.save();
            res.json({ success: true, message: 'Attendance marked successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAttendanceReport: async (req, res) => {
        try {
            const { startDate, endDate, staffId } = req.query;
            const query = {};
            
            if (staffId) query.staffId = staffId;
            if (startDate && endDate) {
                query.date = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const report = await StaffAttendance.find(query)
                .populate('staffId', 'name employeeId department')
                .sort({ date: -1 });

            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = attendanceController;
