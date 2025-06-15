// utils/reportGenerator.js

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * Generates a PDF based on the provided report data and type.
 * @param {Object} reportData - The data to be included in the PDF.
 * @param {String} type - The type of the report (e.g., 'academic', 'attendance', 'behavior').
 * @returns {Promise<String>} - A promise that resolves to the URL of the generated PDF.
 */
const generatePDF = async (reportData, type) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Create a unique file name and determine the output path.
      const fileName = `report_${Date.now()}.pdf`;
      // Adjust the relative path as needed. Here, we assume a "public/reports" folder exists.
      const reportsDir = path.join(__dirname, '..', 'public', 'reports');
      const filePath = path.join(reportsDir, fileName);
      
      // Ensure the reports directory exists.
      fs.mkdirSync(reportsDir, { recursive: true });
      
      // Create a write stream for the PDF file.
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add a title for the report.
      doc
        .fontSize(20)
        .text(`Report: ${capitalize(type)}`, { align: 'center' })
        .moveDown();

      // Render content based on the type of report.
      switch (type) {
        case 'academic':
          renderAcademicReport(doc, reportData);
          break;
        case 'attendance':
          renderAttendanceReport(doc, reportData);
          break;
        case 'behavior':
          renderBehavioralReport(doc, reportData);
          break;
        default:
          doc.text('Unknown report type.');
      }
      
      // Finalize the PDF and end the document.
      doc.end();
      
      // When the stream is finished, resolve the promise with the file URL.
      stream.on('finish', () => {
        // Assuming your server serves static files from the "public" directory,
        // the URL might look something like the one below.
        const fileUrl = `http://localhost:3000/reports/${fileName}`;
        resolve(fileUrl);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Renders an academic report into the PDF document.
 * @param {PDFDocument} doc - The PDFDocument instance.
 * @param {Object} reportData - The data containing academic report details.
 */
const renderAcademicReport = (doc, reportData) => {
  // Render summary section
  if (reportData.summary) {
    doc
      .fontSize(16)
      .text('Summary', { underline: true })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Average Score: ${reportData.summary.averageScore.toFixed(2)}`)
      .text(`Highest Score: ${reportData.summary.highestScore}`)
      .text(`Lowest Score: ${reportData.summary.lowestScore}`)
      .text(`Pass Rate: ${reportData.summary.passRate.toFixed(2)}%`)
      .moveDown();
  }

  // Render grades
  if (Array.isArray(reportData.grades)) {
    doc
      .fontSize(16)
      .text('Grades', { underline: true })
      .moveDown(0.5);
    reportData.grades.forEach((grade, index) => {
      // Assuming each grade has a student with a name and marks property.
      doc
        .fontSize(12)
        .text(`${index + 1}. ${grade.student.name} - Marks: ${grade.marks}`);
    });
  }
};

/**
 * Renders an attendance report into the PDF document.
 * @param {PDFDocument} doc - The PDFDocument instance.
 * @param {Object} reportData - The data containing attendance report details.
 */
const renderAttendanceReport = (doc, reportData) => {
  // Render summary section
  if (reportData.summary) {
    doc
      .fontSize(16)
      .text('Summary', { underline: true })
      .moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Total Days: ${reportData.summary.totalDays}`)
      .text(`Present Days: ${reportData.summary.presentDays}`)
      .text(`Absent Days: ${reportData.summary.absentDays}`)
      .text(`Attendance Rate: ${reportData.summary.attendanceRate.toFixed(2)}%`)
      .moveDown();
  }

  // Render attendance records
  if (Array.isArray(reportData.attendance)) {
    doc
      .fontSize(16)
      .text('Attendance Records', { underline: true })
      .moveDown(0.5);
    reportData.attendance.forEach((record, index) => {
      // Format the date as needed.
      const recordDate = new Date(record.date).toDateString();
      // Assuming each record has a student with a name and a status property.
      doc
        .fontSize(12)
        .text(`${index + 1}. ${record.student.name} - Status: ${record.status} - Date: ${recordDate}`);
    });
  }
};

/**
 * Renders a behavioral report into the PDF document.
 * @param {PDFDocument} doc - The PDFDocument instance.
 * @param {Object} reportData - The data containing behavioral report details.
 */
const renderBehavioralReport = (doc, reportData) => {
  doc
    .fontSize(16)
    .text('Behavioral Records', { underline: true })
    .moveDown(0.5);
  
  if (Array.isArray(reportData.behavioralRecords) && reportData.behavioralRecords.length) {
    reportData.behavioralRecords.forEach((record, index) => {
      // Assuming each record has a student with a name and a note.
      doc
        .fontSize(12)
        .text(`${index + 1}. ${record.student.name} - Note: ${record.note}`);
    });
  } else {
    doc.fontSize(12).text('No behavioral records available.');
  }
};

/**
 * Utility function to capitalize the first letter of a string.
 * @param {String} str 
 * @returns {String}
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generatePayrollPDF = async (data, type, month, year) => {
    const doc = new PDFDocument();
    
    // Add letterhead
    doc.image(path.join(__dirname, '../assets/logo.png'), 50, 45, { width: 50 })
       .fontSize(20)
       .text('School Name', 110, 50)
       .fontSize(10)
       .text('Address Line 1')
       .text('Phone: XXX-XXX-XXXX | Email: example@school.com');

    // Add report title
    doc.moveDown()
       .fontSize(16)
       .text(`${type === 'monthly' ? 'Monthly' : 'Yearly'} Payroll Report - ${month ? getMonthName(month) : ''} ${year}`, {
           align: 'center'
       });

    // Add table headers
    doc.moveDown()
       .fontSize(12);
    
    const startY = doc.y;
    let currentY = startY;

    // Draw table headers
    const headers = ['Staff Name', 'Basic Pay', 'Allowances', 'Deductions', 'Net Pay'];
    const columnWidth = 100;
    
    headers.forEach((header, i) => {
        doc.text(header, 50 + (i * columnWidth), currentY);
    });

    currentY += 20;

    // Add data rows
    data.forEach(record => {
        if (currentY > 700) { // Check for page overflow
            doc.addPage();
            currentY = 50;
        }

        doc.text(record.staffName, 50, currentY)
           .text(`₹${record.basicPay.toLocaleString()}`, 150, currentY)
           .text(`₹${record.totalAllowances.toLocaleString()}`, 250, currentY)
           .text(`₹${record.totalDeductions.toLocaleString()}`, 350, currentY)
           .text(`₹${record.netPay.toLocaleString()}`, 450, currentY);

        currentY += 20;
    });

    return doc;
};

const generatePayrollExcel = async (data, type, month, year) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Payroll_${month || ''}_${year}`);

    // Add headers
    worksheet.columns = [
        { header: 'Staff Name', key: 'staffName', width: 20 },
        { header: 'Basic Pay', key: 'basicPay', width: 15 },
        { header: 'HRA', key: 'hra', width: 15 },
        { header: 'DA', key: 'da', width: 15 },
        { header: 'Travel', key: 'travel', width: 15 },
        { header: 'Medical', key: 'medical', width: 15 },
        { header: 'PF', key: 'pf', width: 15 },
        { header: 'TDS', key: 'tds', width: 15 },
        { header: 'Prof. Tax', key: 'profTax', width: 15 },
        { header: 'Net Pay', key: 'netPay', width: 15 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    data.forEach(record => {
        worksheet.addRow({
            staffName: record.staffName,
            basicPay: record.basicPay,
            hra: record.allowances.hra,
            da: record.allowances.da,
            travel: record.allowances.travelAllowance,
            medical: record.allowances.medicalAllowance,
            pf: record.deductions.pf,
            tds: record.deductions.tds,
            profTax: record.deductions.professionalTax,
            netPay: record.netPay
        });
    });

    // Style number columns
    ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
        worksheet.getColumn(col).numFmt = '₹#,##0.00';
        worksheet.getColumn(col).alignment = { horizontal: 'right' };
    });

    return workbook;
};

const generatePayslip = async (record) => {
    const doc = new PDFDocument();

    // Add letterhead
    doc.image(path.join(__dirname, '../assets/logo.png'), 50, 45, { width: 50 })
       .fontSize(20)
       .text('School Name', 110, 50)
       .fontSize(10)
       .text('Address Line 1')
       .text('Phone: XXX-XXX-XXXX | Email: example@school.com');

    // Add payslip title
    doc.moveDown()
       .fontSize(16)
       .text(`Salary Slip - ${getMonthName(record.month)} ${record.year}`, {
           align: 'center'
       });

    // Add employee details
    doc.moveDown()
       .fontSize(12)
       .text(`Employee Name: ${record.staffName}`)
       .text(`Department: ${record.department || 'N/A'}`);

    // Add salary details in two columns
    const startY = doc.y + 20;
    const colWidth = 250;

    // Left column - Earnings
    doc.text('Earnings:', 50, startY)
       .text(`Basic Pay: ₹${record.basicPay.toLocaleString()}`, 70, startY + 20)
       .text(`HRA: ₹${record.allowances.hra.toLocaleString()}`, 70, startY + 40)
       .text(`DA: ₹${record.allowances.da.toLocaleString()}`, 70, startY + 60)
       .text(`Travel: ₹${record.allowances.travelAllowance.toLocaleString()}`, 70, startY + 80)
       .text(`Medical: ₹${record.allowances.medicalAllowance.toLocaleString()}`, 70, startY + 100);

    // Right column - Deductions
    doc.text('Deductions:', 300, startY)
       .text(`PF: ₹${record.deductions.pf.toLocaleString()}`, 320, startY + 20)
       .text(`TDS: ₹${record.deductions.tds.toLocaleString()}`, 320, startY + 40)
       .text(`Prof. Tax: ₹${record.deductions.professionalTax.toLocaleString()}`, 320, startY + 60);

    // Add totals
    doc.moveDown(8)
       .text('Total Earnings: ₹' + (record.basicPay + record.totalAllowances).toLocaleString(), 50)
       .text('Total Deductions: ₹' + record.totalDeductions.toLocaleString())
       .moveDown()
       .fontSize(14)
       .text('Net Pay: ₹' + record.netPay.toLocaleString(), { underline: true });

    return doc;
};

const getMonthName = (monthNumber) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
};

module.exports = { 
  generatePDF,
  generatePayrollPDF,
  generatePayrollExcel,
  generatePayslip
};
