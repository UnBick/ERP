const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  elements: [{
    id: String,
    type: String,
    content: String,
    position: {
      x: Number,
      y: Number
    },
    size: {
      width: Number,
      height: Number
    },
    style: mongoose.Schema.Types.Mixed
  }],
  canvasSize: {
    width: Number,
    height: Number
  },
  dataBindings: mongoose.Schema.Types.Mixed,
  layers: [mongoose.Schema.Types.Mixed],
  htmlCode: String,
  cssCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Template', templateSchema);
