// backend/src/models/pdfModel.js
const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const PDF = mongoose.model('PDF', pdfSchema);
module.exports = PDF;