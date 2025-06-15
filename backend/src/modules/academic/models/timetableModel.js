const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Timetable = require('../models/timetableModel');
const Section = require('../models/sectionModel');

const getAllTimetables = catchAsync(async (req, res) => {
    const timetables = await Timetable.find()
        .populate('class', 'name')
        .populate('section', 'name')
        .populate('schedule.monday.subject', 'name code')
        .populate('schedule.monday.teacher', 'name')
        .populate('schedule.tuesday.subject', 'name code')
        .populate('schedule.tuesday.teacher', 'name')
        .populate('schedule.wednesday.subject', 'name code')
        .populate('schedule.wednesday.teacher', 'name')
        .populate('schedule.thursday.subject', 'name code')
        .populate('schedule.thursday.teacher', 'name')
        .populate('schedule.friday.subject', 'name code')
        .populate('schedule.friday.teacher', 'name')
        .populate('schedule.saturday.subject', 'name code')
        .populate('schedule.saturday.teacher', 'name');

    res.json(ApiResponse.success('Timetables retrieved successfully', timetables));
});

const createTimetable = catchAsync(async (req, res) => {
    const timetable = await Timetable.create(req.body);
    res.status(201).json(ApiResponse.success('Timetable created successfully', timetable));
});

const updateTimetable = catchAsync(async (req, res) => {
    const timetable = await Timetable.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    res.json(ApiResponse.success('Timetable updated successfully', timetable));
});

const deleteTimetable = catchAsync(async (req, res) => {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    await timetable.remove();
    res.json(ApiResponse.success('Timetable deleted successfully'));
});

const getTimetableByClass = catchAsync(async (req, res) => {
    const { classId, sectionId } = req.params;
    
    const timetable = await Timetable.findOne({
        class: classId,
        section: sectionId,
        isActive: true
    }).populate('schedule.*.subject').populate('schedule.*.teacher');

    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }

    res.json(ApiResponse.success('Timetable retrieved successfully', timetable));
});

// Bulk Upload function (previously added)
const bulkUpload = catchAsync(async (req, res) => {
    // Assuming req.body is an array of timetable objects
    const timetables = await Timetable.insertMany(req.body);
    res.status(201).json(ApiResponse.success('Bulk timetables created successfully', timetables));
});

// New exportTimetable function
const exportTimetable = catchAsync(async (req, res) => {
    // Fetch timetables with basic population (adjust as needed)
    const timetables = await Timetable.find()
        .populate('class', 'name')
        .populate('section', 'name');

    // Convert the timetables data to JSON format
    const jsonData = JSON.stringify(timetables, null, 2);

    // Set headers to prompt a file download
    res.setHeader('Content-Disposition', 'attachment; filename=timetables.json');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).send(jsonData);
});

const getSectionsByClass = catchAsync(async (req, res) => {
    const { classId } = req.params;

    const sections = await Section.find({ class: classId })
        .select('name')
        .lean();

    if (!sections || sections.length === 0) {
        return res.status(404).json(ApiResponse.error('No sections found for this class'));
    }

    res.json(ApiResponse.success('Sections retrieved successfully', sections));
});

module.exports = {
    getAllTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    getTimetableByClass,
    bulkUpload,
    exportTimetable,
    getSectionsByClass
};
