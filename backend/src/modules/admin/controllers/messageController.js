const Message = require('../models/Message');
const MessageTemplate = require('../models/MessageTemplate');
const MessageSettings = require('../models/MessageSettings');
const sendEmail = require('../../../services/emailService');
const sendSMS = require('../../../services/smsService');

const messageController = {
  getSettings: async (req, res) => {
    try {
      let settings = await MessageSettings.findOne();
      if (!settings) {
        settings = await MessageSettings.create({
          emailEnabled: true,
          smsEnabled: false,
          whatsappEnabled: false,
          autoRespond: false,
          dailyLimit: 1000,
          defaultLanguage: 'english'
        });
      }
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch settings'
      });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const settings = await MessageSettings.findOneAndUpdate(
        {},
        req.body,
        { new: true, upsert: true }
      );
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getTemplates: async (req, res) => {
    try {
      const templates = await MessageTemplate.find({ isActive: true });
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  createTemplate: async (req, res) => {
    try {
      const template = await MessageTemplate.create(req.body);
      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  updateTemplate: async (req, res) => {
    try {
      const template = await MessageTemplate.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  deleteTemplate: async (req, res) => {
    try {
      await MessageTemplate.findByIdAndDelete(req.params.id);
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  sendMessage: async (req, res) => {
    const { channels, recipients, message, subject } = req.body;
    
    try {
      // Implementation for sending messages through different channels
      if (channels.email) {
        await sendEmail(recipients, subject, message);
      }
      if (channels.sms) {
        await sendSMS(recipients, message);
      }
      // Add other channel implementations

      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  scheduleMessage: async (req, res) => {
    try {
      const { channels, recipients, message, subject, scheduleDate } = req.body;
      
      const newMessage = new Message({
        subject,
        content: message,
        sender: req.user._id,
        recipients,
        channels: Object.keys(channels).filter(key => channels[key]),
        status: 'pending',
        scheduledFor: new Date(scheduleDate)
      });

      await newMessage.save();

      res.json({
        success: true,
        message: 'Message scheduled successfully',
        data: newMessage
      });
    } catch (error) {
      console.error('Schedule message error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to schedule message'
      });
    }
  },

  getHistory: async (req, res) => {
    try {
      const history = await Message.find()
        .sort('-createdAt')
        .limit(50)
        .populate('sender', 'name');

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = messageController;
