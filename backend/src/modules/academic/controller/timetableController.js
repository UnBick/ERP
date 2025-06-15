const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Timetable = require('../models/timetableModel');

// Get all timetables with optional filtering
const getAllTimetables = catchAsync(async (req, res) => {
    const { className, sectionName, day } = req.query;
    const filter = {};
    
    if (className) filter.className = className;
    if (sectionName) filter.sectionName = sectionName;
    if (day) filter.day = day;
    
    const timetables = await Timetable.find(filter);
    res.json(ApiResponse.success('Timetables retrieved successfully', timetables));
});

// Get timetable for specific class and section
const getTimetableByClassAndSection = catchAsync(async (req, res) => {
    const { className, sectionName } = req.params;
    const timetable = await Timetable.find({ className, sectionName });
    
    if (!timetable) {
        return res.status(404).json(ApiResponse.error('Timetable not found'));
    }
    
    res.json(ApiResponse.success('Timetable retrieved successfully', timetable));
});

// Bulk create timetable entries
const bulkCreateTimetable = catchAsync(async (req, res) => {
    const entries = req.body;
    
    // Validate the structure of each entry
    if (!Array.isArray(entries)) {
        return res.status(400).json(ApiResponse.error('Invalid input format'));
    }
    
    // Remove any existing entries for these classes/sections
    const classesAndSections = [...new Set(entries.map(e => `${e.className}-${e.sectionName}`))];
    for (const cs of classesAndSections) {
        const [className, sectionName] = cs.split('-');
        await Timetable.deleteMany({ className, sectionName });
    }
    
    // Create new entries
    const timetables = await Timetable.insertMany(entries);
    res.status(201).json(ApiResponse.success('Timetable created successfully', timetables));
});

// Delete timetable for a class and section
const deleteTimetableByClassAndSection = catchAsync(async (req, res) => {
    const { className, sectionName } = req.params;
    await Timetable.deleteMany({ className, sectionName });
    res.json(ApiResponse.success('Timetable deleted successfully'));
});

// Get teachers by subject
const getTeachersBySubject = catchAsync(async (req, res) => {
    const { subject } = req.params;
    // This would typically query your Staff/Teacher model
    // For now, returning mock data
    const teachers = [
        { _id: '1', name: 'Teacher 1', department: subject },
        { _id: '2', name: 'Teacher 2', department: subject }
    ];
    res.json(ApiResponse.success('Teachers retrieved successfully', teachers));
});

// Validate timetable for conflicts
const validateTimetable = catchAsync(async (req, res) => {
    const { entries } = req.body;
    
    // Check for teacher conflicts
    const conflicts = [];
    entries.forEach((entry1, i) => {
        entries.slice(i + 1).forEach(entry2 => {
            if (entry1.day === entry2.day && 
                entry1.slot === entry2.slot && 
                entry1.teacherName === entry2.teacherName) {
                conflicts.push({
                    type: 'teacher',
                    teacher: entry1.teacherName,
                    day: entry1.day,
                    slot: entry1.slot
                });
            }
        });
    });
    
    if (conflicts.length > 0) {
        return res.status(400).json(ApiResponse.error('Timetable has conflicts', conflicts));
    }
    
    res.json(ApiResponse.success('Timetable validation successful'));
});

module.exports = {
    getAllTimetables,
    getTimetableByClassAndSection,
    bulkCreateTimetable,
    deleteTimetableByClassAndSection,
    getTeachersBySubject,
    validateTimetable
};
