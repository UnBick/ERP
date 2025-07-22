const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    level: {
        type: String,
        enum: ['Primary', 'Middle', 'Secondary', 'Higher Secondary'],
        required: [true, 'Level is required']
    },
    section: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    }],
    // Change subjects to array of objects, not ObjectId
    subjects: [{
        name: {
            type: String,
            required: true
        },
        periodsPerWeek: {
            type: Number,
            required: true,
            min: 1,
            max: 20
        },
        teacher: {
            type: String,
            required: true
        },
        continuousPeriods: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        },
        priority: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        }
    }],
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    academicYear: {
        type: String,
        required: true
    },
    currentStrength: {
        type: Number,
        default: 0
    },
    schedule: {
        type: Map,
        of: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    number: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        set: function(val) {
            // Defensive: handle undefined/null
            if (val === undefined || val === null) return '';
            return val.toString();
        },
        get: function(val) {
            // Defensive: handle undefined/null
            if (val === undefined || val === null) return '';
            return val.toString();
        }
    }
}, {
    timestamps: true
});

// Ensure indexes are properly set
classSchema.index({ number: 1 }, { collation: { locale: 'en', strength: 2 } });
classSchema.index({ isActive: 1 });
classSchema.index({ number: 1, isActive: 1 });

// Add this pre-save middleware
classSchema.pre('save', function(next) {
    if (this.isModified('number')) {
        this.number = this.number.toString().trim();
    }
    next();
});

// Add a static method to find by number
classSchema.statics.findByNumber = async function(num) {
    const searchNum = num.toString().trim();
    console.log('Searching for class with number:', searchNum);
    
    return this.findOne({
        $or: [
            { number: searchNum },
            { name: { $regex: new RegExp(`^Class ${searchNum}$`, 'i') } }
        ],
        isActive: true
    }).exec();
};

module.exports = mongoose.model('Class', classSchema);