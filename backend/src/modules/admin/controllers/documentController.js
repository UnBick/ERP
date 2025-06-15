const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Student = require('../../student/models/studentModel');
const IdCardTemplate = require('../../student/models/idCardTemplateModel');
const { generatePDF } = require('../../../services/pdfService');
const Class = require('../../academic/models/classModel');
const Section = require('../../academic/models/sectionModel');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

exports.getClassesAndSections = catchAsync(async (req, res) => {
    const classes = await Class.find({ isActive: true })
        .select('_id name')
        .lean();

    const sections = await Section.find({ isActive: true })
        .select('_id name class')
        .lean();

    res.json(ApiResponse.success('Data retrieved successfully', { 
        classes,
        sections
    }));
});

exports.generateDocument = async (req, res) => {
    try {
        const { template, data, documentType } = req.body;
        console.log('Received template data:', template);
        console.log('Received document data:', data);

        // Register handlebars helper
        handlebars.registerHelper('each', function(context, options) {
            return context ? context.map(item => options.fn(item)).join('') : '';
        });

        // Compile the template
        const htmlTemplate = handlebars.compile(template.html);
        const htmlContent = htmlTemplate(data);

        // Create final HTML with styles
        const finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    ${template.css}
                    @page { margin: 1cm; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>${htmlContent}</body>
            </html>
        `;

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(finalHtml, {
            waitUntil: ['domcontentloaded', 'networkidle0']
        });

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm'
            }
        });

        await browser.close();

        // Send response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${documentType}_${Date.now()}.pdf`);
        res.send(pdf);

    } catch (error) {
        console.error('Document generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating document',
            error: error.message
        });
    }
};

function calculateGrade(score) {
    if (!score) return '-';
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'F';
}