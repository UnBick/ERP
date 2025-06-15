// backend/src/models/unbickSchoolingModel.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  gradeLevel: { type: String, required: true },
  availability: { type: Boolean, default: true },
}, { timestamps: true });

const SyllabusSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  description: { type: String },
  predefined: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const UnbickSchoolingModel = mongoose.model('UnbickSchooling', {
  books: [BookSchema],
  syllabi: [SyllabusSchema],
});

module.exports = UnbickSchoolingModel;
