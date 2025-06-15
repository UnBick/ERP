const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video', 'document'],
        default: 'image'
    },
    title: String,
    description: String,
    order: Number
});

const sectionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    media: [mediaSchema],
    order: Number
});

const facilitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    icon: String,
    images: [mediaSchema],
    features: [String],
    specifications: {
        area: String,
        capacity: Number,
        equipment: [String]
    }
});

const awardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['Academic', 'Sports', 'Cultural', 'Innovation'],
        required: true
    },
    description: String,
    images: [mediaSchema],
    recipients: [{
        name: String,
        class: String,
        photo: String
    }]
});

const councilMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    class: String,
    photo: String,
    responsibilities: [String],
    achievements: [String],
    house: {
        name: String,
        color: String,
        icon: String
    }
});

const aboutSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['school', 'principal', 'philosophy', 'infrastructure', 'awards', 'council', 'disclosure'],
        required: true
    },
    // School About Content
    sections: [sectionSchema],
    stats: {
        yearsOfExcellence: Number,
        totalStudents: Number,
        totalFaculty: Number,
        successRate: Number
    },
    milestones: [{
        year: Number,
        title: String,
        description: String
    }],

    // Principal's Message
    principal: {
        name: String,
        title: String,
        qualifications: [String],
        message: String,
        image: String,
        signature: String,
        socialLinks: {
            linkedin: String,
            twitter: String
        }
    },

    // Philosophy & Mission
    philosophy: {
        vision: {
            text: String,
            image: String
        },
        mission: {
            points: [String],
            image: String
        },
        coreValues: [{
            name: String,
            description: String,
            icon: String
        }]
    },

    // Infrastructure
    facilities: [facilitySchema],

    // Awards & Recognition
    awards: [awardSchema],

    // Student Council
    council: {
        academicYear: String,
        headBoy: councilMemberSchema,
        headGirl: councilMemberSchema,
        houseLeaders: [councilMemberSchema],
        members: [councilMemberSchema]
    },

    // Mandatory Disclosure
    disclosure: {
        affiliationNumber: String,
        schoolCode: String,
        address: String,
        contact: {
            phone: [String],
            email: [String]
        },
        documents: [{
            type: String,
            title: String,
            url: String,
            uploadedAt: Date
        }]
    },

    media: {
        gallery: [mediaSchema],
        mainImage: String,
        backgroundImage: String
    },

    lastUpdated: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    },

    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Indexes
aboutSchema.index({ type: 1 }, { unique: true });
aboutSchema.index({ 'awards.year': -1 });
aboutSchema.index({ 'sections.title': 'text', 'sections.content': 'text' });

const AboutContent = mongoose.model('AboutContent', aboutSchema);
module.exports = AboutContent;