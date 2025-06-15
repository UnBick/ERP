// backend/src/controllers/pdfController.js
const PDF = require('../models/pdfModel');
const path = require('path');
const fs = require('fs');

const uploadPDF = async (req, res) => {
  try {
    const { class: className, subject, title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const pdf = new PDF({
      class: className,
      subject,
      title,
      filePath: file.path,
    });

    await pdf.save();
    res.status(201).json({ message: 'PDF uploaded successfully', pdf });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getPDFs = async (req, res) => {
  try {
    const { class: className, subject } = req.query;
    const query = {};

    if (className) query.class = className;
    if (subject) query.subject = subject;

    const pdfs = await PDF.find(query);
    res.status(200).json({ pdfs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const viewPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const pdf = await PDF.findById(id);

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.sendFile(path.resolve(pdf.filePath));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { uploadPDF, getPDFs, viewPDF };