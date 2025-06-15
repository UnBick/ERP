// controllers/websiteController.js

const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const WebsiteSettings = require('../models/websiteSettingsModel');
const Theme = require('../models/themeModel');

// Models for static content and gallery items
const WebsiteContent = require('../models/aboutModel'); // For "about" and "activities" pages
const Gallery = require('../models/galleryModel'); // For gallery images

const { uploadToStorage } = require('../../../utils/fileUpload');

//////////////////////////////
// Website Content Controllers
//////////////////////////////

// GET /website/about
exports.getAboutContent = catchAsync(async (req, res) => {
  const content = await WebsiteContent.findOne({ page: 'about' });
  if (!content) {
    return res.status(404).json(ApiResponse.error('About content not found'));
  }
  res.json(ApiResponse.success('About content retrieved', content));
});

// PUT /website/about
exports.updateAboutContent = catchAsync(async (req, res) => {
  const updateData = { ...req.body };

  // If an image file is provided, upload it and set the image URL.
  if (req.file) {
    const fileUrl = await uploadToStorage(req.file, 'about');
    updateData.image = fileUrl;
  }

  // Update (or create) the "about" content.
  const content = await WebsiteContent.findOneAndUpdate(
    { page: 'about' },
    updateData,
    { new: true, upsert: true }
  );

  res.json(ApiResponse.success('About content updated', content));
});

// GET /website/activities
exports.getActivities = catchAsync(async (req, res) => {
  const content = await WebsiteContent.findOne({ page: 'activities' });
  if (!content) {
    return res.status(404).json(ApiResponse.error('Activities content not found'));
  }
  res.json(ApiResponse.success('Activities content retrieved', content));
});

// PUT /website/activities
exports.updateActivities = catchAsync(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    const fileUrl = await uploadToStorage(req.file, 'activities');
    updateData.image = fileUrl;
  }

  const content = await WebsiteContent.findOneAndUpdate(
    { page: 'activities' },
    updateData,
    { new: true, upsert: true }
  );

  res.json(ApiResponse.success('Activities content updated', content));
});

// POST /website/gallery
exports.uploadToGallery = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json(ApiResponse.error('No images uploaded'));
  }

  const uploadedImages = [];
  // Process each uploaded file.
  for (const file of req.files) {
    const fileUrl = await uploadToStorage(file, 'gallery');
    const galleryItem = await Gallery.create({
      imageUrl: fileUrl,
      uploadedBy: req.user._id,
      createdAt: new Date(),
    });
    uploadedImages.push(galleryItem);
  }

  res.status(201).json(ApiResponse.success('Gallery images uploaded', uploadedImages));
});

// DELETE /website/gallery/:id
exports.deleteFromGallery = catchAsync(async (req, res) => {
  const { id } = req.params;
  const galleryItem = await Gallery.findByIdAndDelete(id);
  if (!galleryItem) {
    return res.status(404).json(ApiResponse.error('Gallery item not found'));
  }
  res.json(ApiResponse.success('Gallery item deleted', galleryItem));
});

//////////////////////////////
// Theme Management Controllers
//////////////////////////////

// GET /theme/current (or similar route)
exports.getCurrentTheme = catchAsync(async (req, res) => {
  const theme = await Theme.findOne({ isActive: true });
  if (!theme) {
    return res.status(404).json(ApiResponse.error('No active theme found'));
  }
  res.json(ApiResponse.success('Current theme retrieved', theme));
});

// GET /theme/saved (or similar route)
exports.getSavedThemes = catchAsync(async (req, res) => {
  const themes = await Theme.find({ status: 'saved' })
    .select('name theme createdAt')
    .sort('-createdAt');
  res.json(ApiResponse.success('Saved themes retrieved', themes));
});

// PUT /theme (update the active theme)
exports.updateTheme = catchAsync(async (req, res) => {
  const { colors, fonts, spacing, borderRadius, shadows, name } = req.body;

  const theme = await Theme.findOneAndUpdate(
    { isActive: true },
    {
      theme: { colors, fonts, spacing, borderRadius, shadows },
      name,
      lastUpdated: {
        by: req.user._id,
        date: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  // Generate and save CSS variables for the theme.
  await generateThemeCSS(theme);

  res.json(ApiResponse.success('Theme updated successfully', theme));
});

// POST /theme/preset (save a new theme preset)
exports.saveThemePreset = catchAsync(async (req, res) => {
  const { name, theme: themeData } = req.body;

  const savedTheme = await Theme.create({
    name,
    theme: themeData,
    status: 'saved',
    createdBy: req.user._id,
  });

  res.status(201).json(ApiResponse.success('Theme preset saved', savedTheme));
});

//////////////////////////////
// Website Settings Controllers
//////////////////////////////

// GET /settings
exports.getSettings = catchAsync(async (req, res) => {
  const settings = await WebsiteSettings.findOne()
    .populate('theme')
    .populate('lastUpdated.by', 'name');

  if (!settings) {
    return res.status(404).json(ApiResponse.error('Website settings not found'));
  }

  res.json(ApiResponse.success('Website settings retrieved', settings));
});

// PUT /settings
exports.updateSettings = catchAsync(async (req, res) => {
  const { siteTitle, description, keywords, analytics, social } = req.body;

  const settings = await WebsiteSettings.findOneAndUpdate(
    {},
    {
      siteTitle,
      description,
      keywords,
      analytics,
      social,
      lastUpdated: {
        by: req.user._id,
        date: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  res.json(ApiResponse.success('Website settings updated', settings));
});

// POST /settings/logo (upload a new logo)
exports.uploadLogo = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('No file uploaded'));
  }

  const fileUrl = await uploadToStorage(req.file, 'logos');

  await WebsiteSettings.findOneAndUpdate(
    {},
    {
      logo: fileUrl,
      'lastUpdated.by': req.user._id,
      'lastUpdated.date': new Date(),
    }
  );

  res.json(ApiResponse.success('Logo uploaded successfully', { fileUrl }));
});

//////////////////////////////
// Helper Functions
//////////////////////////////

/**
 * Generates CSS custom properties from the theme object and saves it.
 */
const generateThemeCSS = async (theme) => {
  const css = `
    :root {
      ${Object.entries(theme.theme.colors)
        .map(([key, value]) => `--color-${key}: ${value};`)
        .join('\n')}
      
      --font-heading: ${theme.theme.fonts.heading};
      --font-body: ${theme.theme.fonts.body};
      --base-size: ${theme.theme.fonts.sizes.base}px;
      --scale: ${theme.theme.fonts.sizes.scale};
      
      --spacing-unit: ${theme.theme.spacing.unit}px;
      --spacing-scale: ${theme.theme.spacing.scale};
      
      ${Object.entries(theme.theme.borderRadius)
        .map(([key, value]) => `--radius-${key}: ${value}px;`)
        .join('\n')}
      
      ${Object.entries(theme.theme.shadows)
        .map(([key, value]) => `--shadow-${key}: ${value};`)
        .join('\n')}
    }
  `;

  // Save the generated CSS to the theme document.
  theme.compiledCSS = css;
  await theme.save();
};

module.exports = exports;
