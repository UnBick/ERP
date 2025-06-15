const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        required: true,
        unique: true
    },
    student: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        bloodGroup: String,
        nationality: String,
        religion: String,
        category: String
    },
    academic: {
        appliedClass: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        },
        previousSchool: String,
        previousClass: String,
        academicYear: String,
        transferCertificate: String
    },
    parents: {
        father: {
            name: String,
            occupation: String,
            education: String,
            contact: String,
            email: String
        },
        mother: {
            name: String,
            occupation: String,
            education: String,
            contact: String,
            email: String
        },
        guardian: {
            name: String,
            relation: String,
            contact: String,
            email: String
        }
    },
    contact: {
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            country: String
        },
        phone: String,
        alternatePhone: String,
        email: String
    },
    documents: [{
        type: { type: String },
        name: String,
        url: String,
        verified: Boolean,
        uploadedAt: Date
    }],
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'approved', 'rejected', 'enrolled'],
        default: 'pending'
    },
    fees: {
        amount: Number,
        paid: Boolean,
        transactionId: String,
        paymentDate: Date
    },
    remarks: String,
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    enrollmentDetails: {
        enrollmentNumber: String,
        enrollmentDate: Date,
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }
    }
}, { timestamps: true });

admissionSchema.index({ applicationNumber: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ 'student.firstName': 1, 'student.lastName': 1 });

module.exports = mongoose.model('Admission', admissionSchema);