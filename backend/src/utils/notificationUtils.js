const nodemailer = require('nodemailer');
const webpush = require('web-push');
const config = require('../config/appConfig');
const Template = require('../modules/settings/models/templateModel');
const Settings = require('../modules/settings/models/Settings');

if (!config || !config.email) {
    throw new Error('Config or config.email is not defined. Please check your configuration in dbConfig.js or appConfig.js.');
}

// Initialize transporter only if email is enabled
let transporter = null;
if (config.email.enabled) {
    transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: config.email.auth
    });
}

// Configure web push only if enabled
if (config.push.enabled) {
    webpush.setVapidDetails(
        `mailto:${config.push.email}`,
        config.push.publicKey,
        config.push.privateKey
    );
}

class NotificationUtils {
    static async sendEmail(to, subject, templateName, data = {}) {
        if (!config.email.enabled) {
            console.log('Email notifications are disabled');
            return null;
        }
        try {
            const mailOptions = {
                from: `"ERP System" <${config.email.auth.user}>`,
                to,
                subject,
                text: data.text || 'Please enable HTML to view this email',
                html: data.html || '<p>Email content</p>'
            };

            const info = await transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
    }

    static async sendPushNotification(subscription, payload) {
        if (!config.push.enabled) {
            console.log('Push notifications are disabled');
            return null;
        }
        try {
            await webpush.sendNotification(subscription, JSON.stringify(payload));
            return true;
        } catch (error) {
            console.error('Push notification failed:', error);
            throw error;
        }
    }

    static async sendTestNotification(options) {
        const { type, recipient, template } = options;
        
        if (type === 'email') {
            return this.sendEmail(
                recipient,
                'Test Email',
                template,
                { test: 'This is a test notification' }
            );
        } else if (type === 'push') {
            return this.sendPushNotification(
                recipient,
                { title: 'Test Push', body: 'This is a test notification' }
            );
        }
    }

    static async sendBulkNotifications(recipients, template, data) {
        const promises = recipients.map(recipient => 
            this.sendEmail(recipient, template.subject, template.name, data)
        );
        return Promise.all(promises);
    }
}

module.exports = NotificationUtils;