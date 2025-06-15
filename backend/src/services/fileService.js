// src/services/fileService.js
const fs = require('fs');
const path = require('path');

/**
 * Upload a file
 * @param {Object} file - File object
 * @param {String} uploadPath - Path to upload the file
 */
const uploadFile = (file, uploadPath) => {
  const filePath = path.join(uploadPath, file.name);

  // Move the file to the upload path
  file.mv(filePath, (err) => {
    if (err) {
      throw new Error('File upload failed');
    }
  });

  return filePath;
};

/**
 * Delete a file
 * @param {String} filePath - Path of the file to delete
 */
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error('File deletion failed');
    }
  });
};

module.exports = {
  uploadFile,
  deleteFile,
};