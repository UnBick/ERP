const IdCardTemplate = require('../modules/student/models/idCardTemplateModel');
const templateService = require('./templateService');

class ReportService {
  async generateReport(data, type) {
    try {
      // Get the appropriate template
      const template = await IdCardTemplate.findOne({ 
        type: type,
        isDefault: true 
      });

      if (!template) {
        throw new Error(`No default template found for type: ${type}`);
      }

      // Render the template with data
      const html = await templateService.renderTemplate(template, data);
      
      // Convert to PDF
      const pdf = await templateService.generatePDF(html);
      
      return pdf;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();
