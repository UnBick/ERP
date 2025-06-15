const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
const ensureUploadDir = async (folderName) => {
  try {
    const fullPath = path.join(uploadDir, folderName);
    await fs.mkdir(fullPath, { recursive: true });
    return fullPath;
  } catch (error) {
    console.error('Failed to create directory:', error);
    throw error;
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Configure multer upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (!isValid) {
      cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Utility function to get file URL
const getFileUrl = (file) => {
  if (!file) return null;
  // Remove the base path and use forward slashes
  const relativePath = file.path.split('uploads')[1].replace(/\\/g, '/');
  return `/uploads${relativePath}`;
};

// Handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

const uploadToStorage = async (file, folder) => {
  const uploadsDir = path.join(__dirname, '../../uploads', folder);
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadsDir, fileName);
  
  await fs.writeFile(filePath, file.buffer);
  return `/uploads/${folder}/${fileName}`;
};

const deleteFile = async (filePath) => {
  if (!filePath) return;
  try {
    const absolutePath = path.join(__dirname, '../..', filePath);
    await fs.unlink(absolutePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  upload,
  handleUploadError,
  getFileUrl,
  uploadDir,
  uploadToStorage,
  deleteFile
};
