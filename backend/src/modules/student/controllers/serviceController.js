const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Student = require('../models/studentModel');
const Class = require('../../academic/models/classModel');
const Section = require('../../academic/models/sectionModel');
const PDFDocument = require('pdfkit');
//const { generateQRCode } = require('../../../utils/qrCodeUtils');
const { formatDate } = require('../../../utils/dateUtils');
const path = require('path');
const fs = require('fs').promises;
const Result = require('../models/resultModel');

const DOCUMENT_TYPES = {
    REPORT_CARD: {
        template: 'report-card.pdf',
        handler: generateReportCard
    },
    TRANSFER_CERT: {
        template: 'transfer-certificate.pdf',
        handler: generateTransferCertificate
    },
    ID_CARD: {
        template: 'id-card.pdf',
        handler: generateIDCard
    },
    CHARACTER_CERT: {
        template: 'character-certificate.pdf',
        handler: generateCharacterCertificate
    }
};

exports.generateDocument = catchAsync(async (req, res) => {
  try {
    const { documentType, scope, classId, sectionId, studentId, year } = req.body;
    
    console.log('Generate Document Request:', {
      documentType,
      scope,
      classId,
      sectionId,
      studentId,
      year
    });

    if (!DOCUMENT_TYPES[documentType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    let query = { isActive: true };
    
    switch (scope) {
      case 'INDIVIDUAL':
        if (!studentId) {
          return res.status(400).json({
            success: false,
            message: 'Student ID is required for individual scope'
          });
        }
        query._id = studentId;
        break;

      case 'SECTION':
        if (!classId || !sectionId) {
          return res.status(400).json({
            success: false,
            message: 'Class and Section IDs are required for section scope'
          });
        }
        query['academicInfo.class'] = classId;
        query['academicInfo.section'] = sectionId;
        break;

      case 'CLASS':
        if (!classId) {
          return res.status(400).json({
            success: false,
            message: 'Class ID is required for class scope'
          });
        }
        query['academicInfo.class'] = classId;
        break;

      case 'SCHOOL':
        // No additional query needed
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid scope'
        });
    }

    console.log('Query:', query);

    const students = await Student.find(query)
      .populate({
        path: 'academicInfo.class',
        select: 'name'
      })
      .populate({
        path: 'academicInfo.section',
        select: 'name'
      })
      .lean();

    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found for the given criteria'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ autoFirstPage: false });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      `attachment; filename=${documentType.toLowerCase()}_${scope.toLowerCase()}_${Date.now()}.pdf`
    );
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Generate document for each student
    for (const student of students) {
      try {
        if (DOCUMENT_TYPES[documentType].handler) {
          await DOCUMENT_TYPES[documentType].handler(doc, student, req.body.year);
        }
      } catch (error) {
        console.error(`Error processing student ${student._id}:`, error);
        doc.addPage();
        doc.text(`Error processing student: ${error.message}`);
      }
    }

    // End the document
    doc.end();

  } catch (error) {
    console.error('Document generation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error generating document'
    });
  }
});

exports.downloadDocument = catchAsync(async (req, res) => {
  const { id } = req.params;
  const document = await Document.findById(id);
  
  if (!document) {
    return res.status(404).json(ApiResponse.error('Document not found'));
  }

  const filePath = path.join(__dirname, '../../../../uploads/documents', document.fileName);
  res.download(filePath);
});

exports.getStudentDocuments = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const documents = await Document.find({ student: studentId })
    .sort('-createdAt');

  return res.json(ApiResponse.success('Documents retrieved successfully', documents));
});

async function generateReportCard(doc, student, year) {
  try {
    doc.addPage();

    // Add basic details first
    doc.fontSize(20).text('School Report Card', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('Student Details', { underline: true });
    doc.moveDown();

    // Student Details with null checks
    const studentDetails = [
      ['Name', `${student?.personalInfo?.firstName || ''} ${student?.personalInfo?.lastName || ''}`],
      ['Class', student?.academicInfo?.class?.name || 'N/A'],
      ['Section', student?.academicInfo?.section?.name || 'N/A'],
      ['Roll Number', student?.academicInfo?.rollNumber || 'N/A'],
      ['Academic Year', year || new Date().getFullYear()]
    ];

    // Add student details
    studentDetails.forEach(([label, value]) => {
      doc.fontSize(12).text(`${label}: ${value}`);
      doc.moveDown(0.5);
    });

    doc.moveDown();

    try {
      // Fetch results with proper error handling
      const results = await Result.find({
        student: student._id,
        academicYear: year
      })
      .populate('subject')
      .lean();

      // Add results table
      doc.fontSize(14).text('Academic Performance', { underline: true });
      doc.moveDown();

      // Table headers
      const startX = 50;
      const columnWidth = 120;
      
      doc.fontSize(12);
      doc.font('Helvetica-Bold');
      [
        'Subject',
        'Marks Obtained',
        'Total Marks',
        'Grade'
      ].forEach((header, i) => {
        doc.text(header, startX + (i * columnWidth), doc.y, {
          width: columnWidth,
          align: 'left'
        });
      });

      doc.moveDown();
      doc.font('Helvetica');

      // If results exist, add them to the table
      if (results && results.length > 0) {
        results.forEach(result => {
          const y = doc.y;
          doc.text(result.subject?.name || 'N/A', startX, y);
          doc.text(result.marksObtained?.toString() || '0', startX + columnWidth, y);
          doc.text(result.totalMarks?.toString() || '0', startX + (2 * columnWidth), y);
          doc.text(result.grade || 'N/A', startX + (3 * columnWidth), y);
          doc.moveDown();
        });

        // Add total/percentage
        doc.moveDown();
        const totalMarks = results.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
        const maxMarks = results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 'N/A';

        doc.font('Helvetica-Bold');
        doc.text(`Total Marks: ${totalMarks}/${maxMarks}`, { align: 'right' });
        doc.text(`Percentage: ${percentage}%`, { align: 'right' });

      } else {
        doc.moveDown();
        doc.text('No results available for this academic year', {
          align: 'center',
          color: 'gray'
        });
      }

    } catch (error) {
      console.error('Error fetching or processing results:', error);
      doc.moveDown();
      doc.fontSize(12).text('Error loading academic results', {
        align: 'center',
        color: 'red'
      });
    }

    // Add footer
    doc.moveDown(2);
    doc.fontSize(10).text('This is a computer-generated report card.', {
      align: 'center',
      color: 'gray'
    });

  } catch (error) {
    console.error('Error in generateReportCard:', error);
    doc.addPage();
    doc.fontSize(12).text('Error generating report card: ' + error.message, {
      color: 'red'
    });
  }
}

async function generateTransferCertificate(doc, student) {
    try {
        doc.addPage();
        
        // Header
        doc.fontSize(18).text('Transfer Certificate', { align: 'center' });
        doc.moveDown();

        // Format dates directly if formatDate is not available
        const formatDateFallback = (date) => {
            if (!date) return 'N/A';
            try {
                return new Date(date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            } catch (error) {
                return 'N/A';
            }
        };

        // Certificate Content with null checks
        doc.fontSize(12);
        const studentName = `${student?.personalInfo?.firstName || ''} ${student?.personalInfo?.lastName || ''}`.trim() || 'N/A';
        const rollNo = student?.academicInfo?.rollNumber || 'N/A';
        const fatherName = student?.parentInfo?.fatherName || student?.contactInfo?.guardianName || 'N/A';
        const className = student?.academicInfo?.class?.name || 'N/A';
        const sectionName = student?.academicInfo?.section?.name || 'N/A';
        const admissionDate = student?.admissionDate ? formatDateFallback(student.admissionDate) : 'N/A';
        const currentDate = formatDateFallback(new Date());

        // Certificate text
        const certificateText = [
            `This is to certify that ${studentName}`,
            `Roll No: ${rollNo}`,
            `Son/Daughter of ${fatherName}`,
            `was a student of Class ${className} Section ${sectionName}`,
            `from ${admissionDate} to ${currentDate}`
        ];

        // Add each line with proper spacing
        certificateText.forEach(line => {
            doc.text(line);
            doc.moveDown(0.5);
        });
        
        // Add signature lines
        doc.moveDown(4);
        doc.text('Class Teacher', 50, doc.y);
        doc.text('Principal', 450, doc.y);

        // Add footer
        doc.moveDown(2);
        doc.fontSize(10);
        doc.text('This is a computer-generated certificate.', {
            align: 'center',
            color: 'gray'
        });

    } catch (error) {
        console.error('Error generating transfer certificate:', error);
        doc.addPage();
        doc.fontSize(12).text('Error generating transfer certificate: ' + error.message, {
            color: 'red'
        });
    }
}

async function generateIDCard(doc, student) {
    try {
        doc.addPage({ size: [243, 153] }); // Standard ID card size

        // School Logo - with error handling
        try {
            doc.image(path.join(__dirname, '../../../assets/logo.png'), 10, 10, { width: 30 });
        } catch (error) {
            console.error('Error loading school logo:', error);
        }
        
        // Student Details with null checks
        doc.fontSize(10);
        const studentName = `${student?.personalInfo?.firstName || ''} ${student?.personalInfo?.lastName || ''}`.trim() || 'N/A';
        const className = student?.academicInfo?.class?.name || 'N/A';
        const sectionName = student?.academicInfo?.section?.name || 'N/A';
        const rollNo = student?.academicInfo?.rollNumber || 'N/A';
        const bloodGroup = student?.personalInfo?.bloodGroup || 'N/A';
        const contact = student?.contactInfo?.phone || student?.parentInfo?.phone || 'N/A';

        // Layout student details
        doc.text(studentName, 10, 50);
        doc.text(`Class: ${className} - ${sectionName}`, 10, 65);
        doc.text(`Roll No: ${rollNo}`, 10, 80);
        doc.text(`Blood Group: ${bloodGroup}`, 10, 95);
        doc.text(`Contact: ${contact}`, 10, 110);

    } catch (error) {
        console.error('Error generating ID card:', error);
        doc.text('Error generating ID card: ' + error.message);
    }
}

async function generateCharacterCertificate(doc, student) {
    try {
        doc.addPage();

        // Header
        doc.fontSize(18).text('Character Certificate', { align: 'center' });
        doc.moveDown();

        // Certificate Content with null checks
        const studentName = `${student?.personalInfo?.firstName || ''} ${student?.personalInfo?.lastName || ''}`.trim() || 'N/A';
        const rollNo = student?.academicInfo?.rollNumber || 'N/A';
        const fatherName = student?.parentInfo?.fatherName || student?.contactInfo?.guardianName || 'N/A';
        const className = student?.academicInfo?.class?.name || 'N/A';
        const sectionName = student?.academicInfo?.section?.name || 'N/A';
        const currentYear = new Date().getFullYear();

        // Certificate text
        doc.fontSize(12);
        const content = `This is to certify that ${studentName}, ` +
            `Roll No. ${rollNo}, son/daughter of ${fatherName} was a student of ` +
            `Class ${className} Section ${sectionName} during the academic session ${currentYear}.` +
            `\n\nDuring his/her stay in the school, his/her conduct and character were found to be GOOD.`;

        doc.text(content, {
            align: 'justify',
            lineGap: 10
        });

        // Signature spaces
        doc.moveDown(4);
        doc.fontSize(11);
        doc.text('Class Teacher', 50, doc.y);
        doc.text('Principal', 450, doc.y);

    } catch (error) {
        console.error('Error generating character certificate:', error);
        doc.text('Error generating character certificate: ' + error.message);
    }
}

module.exports = exports;