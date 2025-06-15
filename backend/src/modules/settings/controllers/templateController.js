const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const IdCardTemplate = require('../../student/models/idCardTemplateModel');

exports.getAllTemplates = catchAsync(async (req, res) => {
    const templates = await IdCardTemplate.find({}).lean();
    res.json(ApiResponse.success('Templates retrieved successfully', templates));
});

exports.getTemplatesByType = catchAsync(async (req, res) => {
    const { type } = req.params;
    const { active } = req.query;
    
    try {
        // First try to get from regular templates
        let query = { type: type.toLowerCase() };
        if (active === 'true') {
            query.isDefault = true;
        }

        let templates = await IdCardTemplate.find(query).lean();
        
        // If no templates found and active is true, get seeded template
        if (templates.length === 0 && active === 'true') {
            templates = await IdCardTemplate.find({ 
                type: type.toLowerCase(),
                isDefault: true
            }).lean();
        }
        
        const formattedTemplates = templates.map(template => ({
            id: template._id,
            name: template.name,
            type: template.type,
            description: template.description || template.name,
            isActive: template.isDefault,
            template: {
                html: template.template?.html?.trim() || '',
                css: template.template?.css?.trim() || ''
            }
        }));

        res.json(ApiResponse.success('Templates retrieved successfully', formattedTemplates));
    } catch (error) {
        console.error('Error in getTemplatesByType:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch templates: ' + error.message));
    }
});

// Add new endpoint for seeded templates
exports.getSeededTemplate = catchAsync(async (req, res) => {
    const { type } = req.params;
    
    try {
        const template = await IdCardTemplate.findOne({
            type: type.toLowerCase(),
            isDefault: true
        }).lean();

        if (!template) {
            return res.status(404).json(ApiResponse.error('No seeded template found'));
        }

        const formattedTemplate = {
            id: template._id,
            name: template.name,
            type: template.type,
            description: template.description || template.name,
            isActive: template.isDefault,
            template: {
                html: template.template.html,
                css: template.template.css
            }
        };

        res.json(ApiResponse.success('Seeded template retrieved successfully', [formattedTemplate]));
    } catch (error) {
        console.error('Error getting seeded template:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch seeded template'));
    }
});

exports.setActiveTemplate = catchAsync(async (req, res) => {
    const { templateId, documentType } = req.body;
    
    try {
        // First, get all templates of this type
        const templates = await IdCardTemplate.find({ type: documentType });
        
        // If no templates exist, return error
        if (!templates || templates.length === 0) {
            return res.status(404).json(ApiResponse.error('No templates found for this document type'));
        }
        
        // If templateId not provided, use the first template
        const targetTemplateId = templateId || templates[0]._id;
        
        // Unset default for all templates of this type
        await IdCardTemplate.updateMany(
            { type: documentType },
            { isDefault: false }
        );
        
        // Set new default template
        const template = await IdCardTemplate.findByIdAndUpdate(
            targetTemplateId,
            { isDefault: true },
            { new: true }
        );
        
        if (!template) {
            return res.status(404).json(ApiResponse.error('Template not found'));
        }
        
        res.json(ApiResponse.success('Template set as active successfully', template));
    } catch (error) {
        console.error('Error in setActiveTemplate:', error);
        res.status(500).json(ApiResponse.error('Failed to set active template'));
    }
});

exports.updateTemplate = catchAsync(async (req, res) => {
    const template = await IdCardTemplate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!template) {
        return res.status(404).json(ApiResponse.error('Template not found'));
    }

    res.json(ApiResponse.success('Template updated successfully', template));
});

exports.deleteTemplate = catchAsync(async (req, res) => {
    const template = await IdCardTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
        return res.status(404).json(ApiResponse.error('Template not found'));
    }

    res.json(ApiResponse.success('Template deleted successfully'));
});

exports.getTemplateCategories = catchAsync(async (req, res) => {
    const categories = [
        { id: 'idcard', name: 'ID Cards' },
        { id: 'certificate', name: 'Certificates' },
        { id: 'reportcard', name: 'Report Cards' }
    ];
    res.json(ApiResponse.success('Template categories retrieved successfully', categories));
});

exports.getTemplateById = catchAsync(async (req, res) => {
    const template = await IdCardTemplate.findById(req.params.id);
    if (!template) {
        return res.status(404).json(ApiResponse.error('Template not found'));
    }
    res.json(ApiResponse.success('Template retrieved successfully', template));
});
