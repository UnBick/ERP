const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Teacher = require('../models/teacherModel');
const Schedule = require('../models/scheduleModel');
const SubstituteRequest = require('../models/substituteRequestModel');
const ScheduleNote = require('../models/scheduleNoteModel');

// Get teacher's schedule
exports.getSchedule = catchAsync(async (req, res) => {
    const { selectedClass } = req.query;
    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate({
            path: 'schedule',
            populate: {
                path: 'subject classroom',
                select: 'name'
            }
        });

    if (!teacher) {
        return res.status(404).json(ApiResponse.error('Teacher not found'));
    }

    let schedule = teacher.schedule;
    if (selectedClass !== 'all') {
        schedule = schedule.filter(item => item.class.toString() === selectedClass);
    }

    // Get schedule conflicts
    const conflicts = await findScheduleConflicts(schedule);

    // Get active substitute requests
    const substituteRequests = await SubstituteRequest.find({
        teacher: teacher._id,
        status: 'pending'
    });

    // Get schedule notes
    const notes = await ScheduleNote.find({
        teacher: teacher._id,
        date: { $gte: new Date() }
    });

    res.json(ApiResponse.success('Schedule retrieved successfully', {
        schedule,
        conflicts,
        substituteRequests,
        notes
    }));
});

// Request substitute
exports.requestSubstitute = catchAsync(async (req, res) => {
    const { classId, date, reason } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    const substituteRequest = await SubstituteRequest.create({
        teacher: teacher._id,
        class: classId,
        date: new Date(date),
        reason,
        status: 'pending'
    });

    res.status(201).json(ApiResponse.success('Substitute request submitted successfully', substituteRequest));
});

// Add schedule note
exports.addScheduleNote = catchAsync(async (req, res) => {
    const { classId, date, note } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    const scheduleNote = await ScheduleNote.create({
        teacher: teacher._id,
        class: classId,
        date: new Date(date),
        note
    });

    res.status(201).json(ApiResponse.success('Note added successfully', scheduleNote));
});

// Get schedule reminders
exports.getReminders = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id });
    
    const upcomingClasses = await Schedule.find({
        teacher: teacher._id,
        date: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        }
    }).populate('class subject classroom');

    res.json(ApiResponse.success('Reminders retrieved successfully', upcomingClasses));
});

// Helper function to find schedule conflicts
const findScheduleConflicts = async (schedule) => {
    const conflicts = [];
    schedule.forEach((class1, index) => {
        schedule.slice(index + 1).forEach(class2 => {
            if (class1.day === class2.day) {
                const time1 = parseTimeRange(class1.time);
                const time2 = parseTimeRange(class2.time);
                if (hasTimeConflict(time1, time2)) {
                    conflicts.push({
                        class1,
                        class2,
                        day: class1.day
                    });
                }
            }
        });
    });
    return conflicts;
};

// Helper function to parse time range
const parseTimeRange = (timeString) => {
    const [start, end] = timeString.split('-');
    return {
        start: new Date(`1970/01/01 ${start.trim()}`),
        end: new Date(`1970/01/01 ${end.trim()}`)
    };
};

// Helper function to check time conflicts
const hasTimeConflict = (time1, time2) => {
    return (time1.start < time2.end && time1.end > time2.start);
};

module.exports = exports;