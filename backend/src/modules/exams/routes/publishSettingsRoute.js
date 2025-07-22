const express = require('express');
const router = express.Router();

// Dummy in-memory store (replace with DB logic)
let publishSettings = [];

// GET all publish settings
router.get('/', (req, res) => {
  res.json({ success: true, data: publishSettings });
});

// POST new publish setting
router.post('/', (req, res) => {
  const setting = { ...req.body, id: Date.now().toString() };
  publishSettings.push(setting);
  res.json({ success: true, data: setting });
});

// PUT update publish setting
router.put('/:id', (req, res) => {
  const idx = publishSettings.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  publishSettings[idx] = { ...publishSettings[idx], ...req.body };
  res.json({ success: true, data: publishSettings[idx] });
});

router.delete('/:id', (req, res) => {
  const idx = publishSettings.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  publishSettings.splice(idx, 1);
  res.json({ success: true, message: 'Deleted successfully' });
});

module.exports = router;
