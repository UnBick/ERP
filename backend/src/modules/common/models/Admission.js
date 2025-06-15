const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  studentDetails: {
    name: String,
    dateOfBirth: Date,
    gender: String,
    bloodGroup: String,
    nationality: String
  },
  parentDetails: {
    fatherName: String,
    motherName: String,
    contact: String,
    email: String,
    address: String,
    occupation: String
  },
  academicDetails: {
    applyingForClass: Number,
    previousSchool: String,
    previousClass: String,
    academicYear: String
  },
  documents: [{
    type: String,
    url: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Admission', admissionSchema);
