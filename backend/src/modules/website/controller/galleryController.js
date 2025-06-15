const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Album = require('../models/albumModel');
const Gallery = require('../models/galleryModel');
const Video = require('../models/videoModel');
const News = require('../models/newsModel');
const { uploadToStorage, deleteFile } = require('../../../utils/fileUpload');

// Album Management
exports.getAlbums = catchAsync(async (req, res) => {
    const albums = await Album.find()
        .populate('coverImage')
        .populate('images')
        .sort('-createdAt');
    
    res.json(ApiResponse.success('Albums retrieved successfully', albums));
});

exports.createAlbum = catchAsync(async (req, res) => {
    const { title, description, category } = req.body;
    
    const album = await Album.create({
        title,
        description,
        category,
        createdBy: req.user._id
    });

    res.status(201).json(ApiResponse.success('Album created successfully', album));
});

exports.updateAlbum = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, category, imageOrder } = req.body;

    const album = await Album.findByIdAndUpdate(
        id,
        {
            title,
            description,
            category,
            imageOrder,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true }
    ).populate('images');

    res.json(ApiResponse.success('Album updated successfully', album));
});

// Photo Management
exports.uploadPhotos = catchAsync(async (req, res) => {
    if (!req.files?.length) {
        return res.status(400).json(ApiResponse.error('No files uploaded'));
    }

    const { albumId } = req.body;
    const uploadPromises = req.files.map(async file => {
        const imageUrl = await uploadToStorage(file, 'gallery');
        return Gallery.create({
            url: imageUrl,
            type: 'image',
            album: albumId,
            title: file.originalname,
            uploadedBy: req.user._id
        });
    });

    const photos = await Promise.all(uploadPromises);
    await Album.findByIdAndUpdate(albumId, {
        $push: { images: { $each: photos.map(p => p._id) } }
    });

    res.status(201).json(ApiResponse.success('Photos uploaded successfully', photos));
});

// Video Management
exports.uploadVideo = catchAsync(async (req, res) => {
    const { title, description, url } = req.body;
    let videoUrl = url;

    if (req.file) {
        videoUrl = await uploadToStorage(req.file, 'videos');
    }

    const video = await Video.create({
        title,
        description,
        url: videoUrl,
        uploadedBy: req.user._id
    });

    res.status(201).json(ApiResponse.success('Video uploaded successfully', video));
});

exports.getVideos = catchAsync(async (req, res) => {
    const videos = await Video.find()
        .populate('uploadedBy', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('Videos retrieved successfully', videos));
});

// News Management
exports.createNews = catchAsync(async (req, res) => {
    const { title, content, category, tags } = req.body;
    let coverImage;

    if (req.file) {
        coverImage = await uploadToStorage(req.file, 'news');
    }

    const news = await News.create({
        title,
        content,
        category,
        tags,
        coverImage,
        author: req.user._id
    });

    res.status(201).json(ApiResponse.success('News created successfully', news));
});

exports.getNews = catchAsync(async (req, res) => {
    const news = await News.find()
        .populate('author', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('News retrieved successfully', news));
});

// Common Operations
exports.deleteMedia = catchAsync(async (req, res) => {
    const { id, type } = req.params;
    const Model = type === 'video' ? Video : Gallery;

    const media = await Model.findById(id);
    if (!media) {
        return res.status(404).json(ApiResponse.error('Media not found'));
    }

    await deleteFile(media.url);
    await Model.findByIdAndDelete(id);

    if (type === 'image') {
        await Album.updateMany(
            { images: id },
            { $pull: { images: id } }
        );
    }

    res.json(ApiResponse.success('Media deleted successfully'));
});

exports.updateMediaInfo = catchAsync(async (req, res) => {
    const { id, type } = req.params;
    const { title, description, category } = req.body;
    const Model = type === 'video' ? Video : Gallery;

    const media = await Model.findByIdAndUpdate(
        id,
        {
            title,
            description,
            category,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true }
    );

    res.json(ApiResponse.success('Media info updated successfully', media));
});

module.exports = exports;