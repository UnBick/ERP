const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Section = require('../../academic/models/sectionModel');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const { mapTemplateFields } = require('../../../utils/templateFieldMapper');
const { extractFields } = require('../../../utils/templateFieldExtractor');
const archiver = require('archiver');
const { mapStudentData } = require('../../../utils/documentFieldMapper');

// Helper function to generate PDF from HTML
async function generatePDF(html, css) {
    let browser = null;
    try {
        console.log('Launching browser for PDF generation');
        browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        console.log('Creating new page');
        const page = await browser.newPage();
        
        console.log('Setting viewport');
        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 2
        });
        
        console.log('Setting page content');
        await page.setContent(html, {
            waitUntil: ['networkidle0', 'domcontentloaded']
        });

        console.log('Generating PDF');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        console.log('PDF generation completed');
        return pdf;
    } catch (error) {
        console.error('Error in PDF generation:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            console.log('Closing browser');
            await browser.close();
        }
    }
}

// Update valid document types constant
const VALID_DOCUMENT_TYPES = new Set([
    'idcard', 'reportcard', 'certificate', 'admission'
]);

function validateDocumentRequest(data) {
    console.log('Validating document request:', {
        type: data.documentType,
        hasTemplate: !!data.template,
        hasData: !!data.data
    });

    // Extract fields from template
    const requiredFields = extractFields(data.template.html);
    console.log('Required template fields:', requiredFields);

    // Map student data to template fields
    const mappedData = mapStudentData(data.data.studentData, requiredFields);
    console.log('Mapped template data:', mappedData);

    return {
        documentType: data.documentType?.toLowerCase(),
        template: {
            html: data.template.html.trim(),
            css: data.template.css.trim()
        },
        data: mappedData
    };
}

exports.generateDocument = catchAsync(async (req, res) => {
    try {
        console.log('Received document request:', {
            documentType: req.body.documentType,
            template: !!req.body.template,
            data: req.body.data
        });

        const validatedData = validateDocumentRequest(req.body);
        
        // Register Handlebars helpers with default value support
        Handlebars.registerHelper('default', function(value, defaultValue) {
            return value || defaultValue || 'N/A';
        });

        Handlebars.registerHelper('each', function(context, options) {
            if (!context || !Array.isArray(context) || context.length === 0) {
                return options.fn({ 
                    name: 'No Data',
                    term1: '-',
                    term2: '-',
                    term3: '-',
                    total: '-',
                    obtained: '-',
                    grade: '-'
                });
            }
            return context.map(item => options.fn(item || {})).join('');
        });

        // Generate PDF with validated data
        const compiledHtml = Handlebars.compile(validatedData.template.html)(validatedData.data);
        const pdf = await generatePDF(compiledHtml, validatedData.template.css);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition', 
            `attachment; filename="${validatedData.documentType}_${Date.now()}.pdf"`
        );
        
        res.send(pdf);
    } catch (error) {
        console.error('Document generation error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate document'
        });
    }
});

exports.getClassAndSectionData = catchAsync(async (req, res) => {
    try {
        const Class = require('../../academic/models/classModel'); // Local import as fallback
        const classes = await Class.find({ isActive: true })
            .select('_id name')
            .sort({ name: 1 })
            .lean();
            
        res.json(ApiResponse.success('Class data retrieved successfully', { classes }));
    } catch (error) {
        console.error('Error fetching class data:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch class data'));
    }
});

exports.getSectionsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const sections = await Section.find({ 
            class: classId,
            isActive: true 
        })
        .select('_id name')
        .sort({ name: 1 })
        .lean();

        res.json(ApiResponse.success('Sections retrieved successfully', sections));
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch sections'));
    }
};

exports.generateBatchDocuments = catchAsync(async (req, res) => {
    const { documentType, template, students, outputFormat } = req.body;

    if (outputFormat === 'single') {
        try {
            console.log('Generating single PDF with multiple pages');
            const allPages = [];
            
            // Generate PDF for each student with proper field mapping
            for (let i = 0; i < students.length; i++) {
                try {
                    console.log(`Processing student ${i + 1}/${students.length}`);
                    const student = students[i];
                    
                    const validatedData = validateDocumentRequest({
                        documentType,
                        template,
                        data: { studentData: student.studentData }
                    });

                    console.log('Validated data for student:', {
                        studentName: student.studentData.studentName,
                        fields: Object.keys(validatedData.data)
                    });

                    const compiledHtml = Handlebars.compile(validatedData.template.html)(validatedData.data);
                    allPages.push(compiledHtml);
                    console.log(`Successfully processed student ${i + 1}`);
                } catch (error) {
                    console.error(`Error processing student ${i + 1}:`, error);
                    // Continue with next student
                }
            }

            console.log('Combining all pages into single document');
            // Combine all pages into one HTML with proper page breaks
            const combinedHtml = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <style>
                            ${template.css}
                            @media print {
                                .page-break {
                                    page-break-after: always;
                                    display: block;
                                    height: 0;
                                    clear: both;
                                }
                                @page {
                                    size: A4;
                                    margin: 0;
                                }
                                body {
                                    margin: 0;
                                    padding: 20px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${allPages.map((page, index) => `
                            <div class="document-page">
                                ${page}
                                ${index < allPages.length - 1 ? '<div class="page-break"></div>' : ''}
                            </div>
                        `).join('')}
                    </body>
                </html>
            `;

            console.log('Generating final PDF');
            const pdf = await generatePDF(combinedHtml, template.css);
            console.log('PDF generated successfully');
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${documentType}_combined_${Date.now()}.pdf`);
            return res.send(pdf);
        } catch (error) {
            console.error('Error generating single PDF:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate combined PDF',
                error: error.message
            });
        }
    } else {
        // For multiple PDFs, use existing ZIP functionality
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=${documentType}_documents_${Date.now()}.zip`
        });

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        // Process each student
        for (const student of students) {
            try {
                const validatedData = validateDocumentRequest({
                    documentType,
                    template,
                    data: student.customData
                });

                // Generate PDF for current student
                const compiledHtml = Handlebars.compile(validatedData.template.html)(validatedData.data);
                const pdf = await generatePDF(compiledHtml, validatedData.template.css);

                // Add PDF to ZIP with student-specific filename
                const fileName = `${student.customData.studentName.replace(/\s+/g, '_')}_${documentType}.pdf`;
                archive.append(pdf, { name: fileName });

            } catch (error) {
                console.error(`Error processing student ${student.customData.studentName}:`, error);
                // Continue with next student
            }
        }

        await archive.finalize();
    }
});