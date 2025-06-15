require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const IdCardTemplate = require('../../src/modules/student/models/idCardTemplateModel');

const templates = [
    {
        name: 'Standard Green Template',
        type: 'idcard',  // Changed from 'student' to 'idcard
        description: 'A professional green-themed ID card template',
        isDefault: true,
        template: {
            html: `
                <div class="id-card">
                    <div class="header">
                        <div class="logo">{{schoolLogo}}</div>
                        <div class="school-name">{{schoolName}}</div>
                    </div>
                    <div class="id-body">
                        <div class="photo">
                            <img src="{{studentPhoto}}" alt="Student Photo">
                        </div>
                        <div class="info">
                            <p><strong>ID:</strong> {{studentId}}</p>
                            <p><strong>Name:</strong> {{studentName}}</p>
                            <p><strong>Class:</strong> {{className}}</p>
                            <p><strong>D.O.B:</strong> {{dateOfBirth}}</p>
                            <p><strong>Address:</strong> {{address}}</p>
                            <p><strong>Phone:</strong> {{phoneNumber}}</p>
                        </div>
                    </div>
                    <div class="footer">
                        <div class="barcode">{{barcode}}</div>
                        <div class="signature">{{principalSignature}}</div>
                    </div>
                </div>
            `,
            css: `
                .id-card {
                    width: 450px;
                    background-color: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                    border: 1px solid #ccc;
                }
                .header {
                    background-color: #a5dfb1;
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                }
                .logo {
                    background-color: white;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    text-align: center;
                    line-height: 50px;
                }
                /* ...existing css... */
            `
        },
        thumbnail: '/images/templates/green-template-thumb.png',
        preview: '/images/templates/green-template-preview.png',
        version: 1
    },
    {
        name: 'Modern Teal Template',
        type: 'idcard',  // Changed from 'student' to 'idcard
        description: 'A modern teal-colored ID card design',
        isDefault: false,
        template: {
            html: `
                <div class="id-card">
                    <div class="header">
                        <div class="logo">{{schoolLogo}}</div>
                        <div class="school-name">{{schoolName}}</div>
                    </div>
                    <div class="content">
                        <div class="photo">
                            <img src="{{studentPhoto}}" alt="Student Photo">
                        </div>
                        <div class="details">
                            <p><strong>ID:</strong> {{studentId}}</p>
                            <p><strong>Name:</strong> {{studentName}}</p>
                            <p><strong>Class:</strong> {{className}}</p>
                            <p><strong>D.O.B:</strong> {{dateOfBirth}}</p>
                            <p><strong>Address:</strong> {{address}}</p>
                            <p><strong>Phone:</strong> {{phoneNumber}}</p>
                            <div class="barcode">{{barcode}}</div>
                            <div class="principal">{{principalSignature}}</div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                .id-card {
                    width: 450px;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                }
                .header {
                    background-color: #8de1c3;
                    color: #000;
                    display: flex;
                    align-items: center;
                    padding: 15px;
                }
                /* ...existing css... */
            `
        },
        thumbnail: '/images/templates/teal-template-thumb.png',
        preview: '/images/templates/teal-template-preview.png',
        version: 1
    }
];

const seedIdCardTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing templates
        await IdCardTemplate.deleteMany({});
        console.log('Cleared existing ID card templates');

        // Insert new templates
        const createdTemplates = await IdCardTemplate.insertMany(templates);
        console.log(`Created ${createdTemplates.length} ID card templates`);

        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error seeding ID card templates:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

// Handle interruptions
process.on('SIGINT', async () => {
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(0);
});

seedIdCardTemplates();
