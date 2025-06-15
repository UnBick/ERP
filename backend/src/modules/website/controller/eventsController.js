const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Event = require('../models/eventModel');
const CalendarEvent = require('../models/calendarEventModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

// Gallery Events Management
exports.getAllEvents = catchAsync(async (req, res) => {
    const { type, startDate, endDate } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const events = await Event.find(query)
        .populate('createdBy', 'name')
        .sort('-date');

    res.json(ApiResponse.success('Events retrieved successfully', events));
});

exports.getEventById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const event = await Event.findById(id)
        .populate('createdBy', 'name')
        .populate('participants');

    if (!event) {
        return res.status(404).json(ApiResponse.error('Event not found'));
    }

    res.json(ApiResponse.success('Event retrieved successfully', event));
});

exports.createEvent = catchAsync(async (req, res) => {
    const { title, description, date, location, type, participants } = req.body;
    
    const event = await Event.create({
        title,
        description,
        date,
        location,
        type,
        participants,
        createdBy: req.user._id
    });

    if (req.files?.length) {
        const imageUrls = await Promise.all(
            req.files.map(file => uploadToStorage(file, 'events'))
        );
        event.images = imageUrls;
        await event.save();
    }

    res.status(201).json(ApiResponse.success('Event created successfully', event));
});

exports.updateEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (req.files?.length) {
        const imageUrls = await Promise.all(
            req.files.map(file => uploadToStorage(file, 'events'))
        );
        updateData.images = [...(updateData.images || []), ...imageUrls];
    }

    const event = await Event.findByIdAndUpdate(
        id,
        { ...updateData, lastUpdated: { by: req.user._id, date: new Date() } },
        { new: true }
    );

    if (!event) {
        return res.status(404).json(ApiResponse.error('Event not found'));
    }

    res.json(ApiResponse.success('Event updated successfully', event));
});

exports.deleteEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
        return res.status(404).json(ApiResponse.error('Event not found'));
    }

    res.json(ApiResponse.success('Event deleted successfully'));
});

// Calendar Events Management
exports.getCalendarEvents = catchAsync(async (req, res) => {
    const { start, end } = req.query;
    const query = {};

    if (start && end) {
        query.startDate = { $gte: new Date(start) };
        query.endDate = { $lte: new Date(end) };
    }

    const events = await CalendarEvent.find(query)
        .populate('createdBy', 'name');

    res.json(ApiResponse.success('Calendar events retrieved successfully', events));
});

exports.createCalendarEvent = catchAsync(async (req, res) => {
    const { title, startDate, endDate, type, description, color } = req.body;

    const event = await CalendarEvent.create({
        title,
        startDate,
        endDate,
        type,
        description,
        color,
        createdBy: req.user._id
    });

    res.status(201).json(ApiResponse.success('Calendar event created successfully', event));
});

exports.updateCalendarEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const event = await CalendarEvent.findByIdAndUpdate(
        id,
        { ...updateData, lastUpdated: { by: req.user._id, date: new Date() } },
        { new: true }
    );

    if (!event) {
        return res.status(404).json(ApiResponse.error('Calendar event not found'));
    }

    res.json(ApiResponse.success('Calendar event updated successfully', event));
});

// File Management
exports.uploadEventImage = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const fileUrl = await uploadToStorage(req.file, 'events');
    res.json(ApiResponse.success('Image uploaded successfully', { fileUrl }));
});

module.exports = exports;