const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Video = require('../models/videoModel');
const { uploadVideo } = require('../../../utils/videoUpload');

exports.createVideo = catchAsync(async (req, res) => {
    const videoData = {
        ...req.body,
        uploadedBy: req.user._id
    };

    if (req.file) {
        const uploadResult = await uploadVideo(req.file);
        videoData.url = uploadResult.url;
        videoData.thumbnail = uploadResult.thumbnail;
    }

    const video = await Video.create(videoData);
    res.status(201).json(ApiResponse.success('Video created successfully', video));
});

exports.getVideos = catchAsync(async (req, res) => {
    const { class: classId, subject, search } = req.query;
    const query = { isActive: true };

    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const videos = await Video.find(query)
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('uploadedBy', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('Videos retrieved successfully', videos));
});

exports.updateVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
        const uploadResult = await uploadVideo(req.file);
        updateData.url = uploadResult.url;
        updateData.thumbnail = uploadResult.thumbnail;
    }

    const video = await Video.findByIdAndUpdate(id, updateData, { new: true });
    res.json(ApiResponse.success('Video updated successfully', video));
});

exports.incrementViewCount = catchAsync(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
    );
    res.json(ApiResponse.success('View count updated', video));
});

exports.deleteVideo = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Video.findByIdAndUpdate(id, { isActive: false });
    res.json(ApiResponse.success('Video deleted successfully'));
});