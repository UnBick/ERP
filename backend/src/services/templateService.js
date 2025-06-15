const IdCardTemplate = require('../modules/student/models/idCardTemplateModel');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');

class TemplateService {
    async getTemplate(type) {
        const template = await IdCardTemplate.findOne({ 
            type: type.toLowerCase(),
            isDefault: true 
        });
        
        if (!template) {
            throw new Error(`No default template found for type: ${type}`);
        }
        return template;
    }

    async renderTemplate(templateData, data) {
        const template = Handlebars.compile(templateData.template.html);
        const html = template(data);
        const css = templateData.template.css;
        
        return `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>${html}</body>
            </html>
        `;
    }

    async generatePDF(html) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: 'A4' });
        await browser.close();
        return pdf;
    }
}

module.exports = new TemplateService();
