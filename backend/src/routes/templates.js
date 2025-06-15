const express = require('express');
const router = express.Router();
const Template = require('../models/template');

router.post('/save', async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.json({
      success: true,
      message: 'Template saved successfully',
      data: template
    });
  } catch (error) {
    console.error('Template save error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving template',
      error: error.message
    });
  }
});

module.exports = router;
