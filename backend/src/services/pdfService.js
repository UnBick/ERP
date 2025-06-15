const puppeteer = require('puppeteer');
const PDFMerger = require('pdf-merger-js');

exports.generatePDF = async (documents) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const merger = new PDFMerger();

    try {
        // Generate individual PDFs
        for (const doc of documents) {
            const page = await browser.newPage();
            await page.setContent(`
                <html>
                    <head>
                        <style>${doc.css}</style>
                    </head>
                    <body>${doc.html}</body>
                </html>
            `);
            const pdf = await page.pdf({ 
                format: 'A4',
                printBackground: true,
                margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
            });
            await merger.add(pdf);
        }

        // Merge all PDFs
        const mergedPdf = await merger.saveAsBuffer();
        return mergedPdf;

    } finally {
        await browser.close();
    }
};
