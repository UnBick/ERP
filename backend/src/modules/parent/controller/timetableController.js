const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Timetable = require('../../academic/models/timetableModel');
const Student = require('../../student/models/studentModel');

exports.getStudentTimetable = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId)
        .populate('class')
        .populate('section');

    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    const timetable = await Timetable.findOne({
        class: student.class,
        section: student.section,
        isActive: true
    })
    .populate('schedule.*.subject', 'name')
    .populate('schedule.*.teacher', 'name');

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    res.json(ApiResponse.success('Timetable retrieved successfully', timetable));
});

exports.getWeeklyTimetable = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    const timetable = await Timetable.findOne({
        class: student.class,
        section: student.section,
        isActive: true
    })
    .populate('schedule.*.subject', 'name code')
    .populate('schedule.*.teacher', 'name');

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    const weeklySchedule = Object.keys(timetable.schedule).reduce((acc, day) => {
        acc[day] = timetable.schedule[day].map(period => ({
            subject: period.subject.name,
            subjectCode: period.subject.code,
            teacher: period.teacher.name,
            startTime: period.startTime,
            endTime: period.endTime,
            room: period.room
        }));
        return acc;
    }, {});

    res.json(ApiResponse.success('Weekly timetable retrieved successfully', weeklySchedule));
});

exports.getTodayTimetable = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    const timetable = await Timetable.findOne({
        class: student.class,
        section: student.section,
        isActive: true
    })
    .populate('schedule.' + today + '.subject', 'name code')
    .populate('schedule.' + today + '.teacher', 'name');

    if (!timetable || !timetable.schedule[today]) {
        return res.status(404).json(ApiResponse.error('No schedule found for today'));
    }

    const todaySchedule = timetable.schedule[today].map(period => ({
        subject: period.subject.name,
        subjectCode: period.subject.code,
        teacher: period.teacher.name,
        startTime: period.startTime,
        endTime: period.endTime,
        room: period.room
    }));

    res.json(ApiResponse.success('Today\'s timetable retrieved successfully', todaySchedule));
});

exports.getSubjectSchedule = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { subjectId } = req.query;

    const student = await Student.findById(studentId);
    const timetable = await Timetable.findOne({
        class: student.class,
        section: student.section,
        isActive: true
    });

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    const subjectSchedule = Object.keys(timetable.schedule).reduce((acc, day) => {
        const periods = timetable.schedule[day].filter(period => 
            period.subject.toString() === subjectId
        );
        if (periods.length > 0) {
            acc[day] = periods;
        }
        return acc;
    }, {});

    res.json(ApiResponse.success('Subject schedule retrieved successfully', subjectSchedule));
});