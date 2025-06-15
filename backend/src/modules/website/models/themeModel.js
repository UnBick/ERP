const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  theme: {
    colors: {
      primary: String,
      secondary: String,
      accent: String,
      text: String,
      background: String,
      header: String,
      footer: String,
      link: String,
      error: String
    },
    fonts: {
      heading: String,
      body: String,
      sizes: {
        base: Number,
        scale: Number
      }
    },
    spacing: {
      unit: Number,
      scale: Number
    },
    borderRadius: {
      small: Number,
      medium: Number,
      large: Number
    },
    shadows: {
      light: String,
      medium: String,
      heavy: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'saved', 'archived'],
    default: 'saved'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  compiledCSS: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date
  }
}, {
  timestamps: true
});

themeSchema.index({ isActive: 1 });
themeSchema.index({ status: 1, createdAt: -1 });

// Use existing model if available, otherwise compile a new one
const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);
module.exports = Theme;
