require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const IdCardTemplate = require('../../src/modules/student/models/idCardTemplateModel');

const templates = [
    {
        name: 'Standard Green Template',
        type: 'idcard',
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
        type: 'idcard',
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
    },
    // NEW TEMPLATE 1: Professional Blue with Front & Back
    {
        name: 'Professional Blue (Front & Back)',
        type: 'idcard',
        description: 'A professional blue ID card with front and back design',
        isDefault: false,
        hasBackPage: true,
        template: {
            html: `
                <div class="id-card-container">
                    <!-- FRONT SIDE -->
                    <div class="id-card front">
                        <div class="header">
                            <div class="logo-section">
                                <img src="{{schoolLogo}}" alt="School Logo" class="logo">
                            </div>
                            <div class="school-info">
                                <h2>{{schoolName}}</h2>
                                <p>STUDENT IDENTIFICATION</p>
                            </div>
                        </div>
                        <div class="main-content">
                            <div class="photo-section">
                                <img src="{{studentPhoto}}" alt="Student Photo" class="student-photo">
                                <div class="student-id">{{studentId}}</div>
                            </div>
                            <div class="info-section">
                                <h3>{{studentName}}</h3>
                                <div class="detail-row">
                                    <span class="label">Class:</span>
                                    <span class="value">{{className}}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">D.O.B:</span>
                                    <span class="value">{{dateOfBirth}}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Valid Until:</span>
                                    <span class="value">{{academicYear}}</span>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <div class="barcode">{{barcode}}</div>
                        </div>
                    </div>
                    
                    <!-- BACK SIDE -->
                    <div class="id-card back">
                        <div class="back-header">
                            <h3>Emergency Contact Information</h3>
                        </div>
                        <div class="contact-info">
                            <div class="contact-section">
                                <h4>Student Address</h4>
                                <p>{{address}}</p>
                            </div>
                            <div class="contact-section">
                                <h4>Contact Number</h4>
                                <p>{{phoneNumber}}</p>
                            </div>
                            <div class="contact-section">
                                <h4>Emergency Contact</h4>
                                <p>{{emergencyContact}}</p>
                            </div>
                            <div class="contact-section">
                                <h4>Blood Group</h4>
                                <p>{{bloodGroup}}</p>
                            </div>
                        </div>
                        <div class="back-footer">
                            <div class="signature-section">
                                <div class="signature">
                                    <img src="{{principalSignature}}" alt="Principal Signature">
                                    <p>Principal</p>
                                </div>
                                <div class="signature">
                                    <div class="student-sign">{{studentName}}</div>
                                    <p>Student</p>
                                </div>
                            </div>
                            <div class="school-contact">
                                <p>{{schoolAddress}} | {{schoolPhone}}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                .id-card-container {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                .id-card {
                    width: 420px;
                    height: 270px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                    overflow: hidden;
                    position: relative;
                    color: white;
                }
                .id-card.front {
                    background: linear-gradient(135deg, #2c5aa0 0%, #1e3c72 100%);
                }
                .id-card.back {
                    background: linear-gradient(135deg, #1e3c72 0%, #2c5aa0 100%);
                }
                .header {
                    background: rgba(255,255,255,0.1);
                    padding: 12px 15px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                }
                .logo-section .logo {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                }
                .school-info {
                    margin-left: 15px;
                }
                .school-info h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: bold;
                }
                .school-info p {
                    margin: 2px 0 0 0;
                    font-size: 10px;
                    opacity: 0.9;
                }
                .main-content {
                    display: flex;
                    padding: 15px;
                    height: 160px;
                }
                .photo-section {
                    text-align: center;
                    margin-right: 15px;
                }
                .student-photo {
                    width: 80px;
                    height: 100px;
                    border-radius: 6px;
                    border: 2px solid rgba(255,255,255,0.3);
                    object-fit: cover;
                }
                .student-id {
                    margin-top: 8px;
                    font-weight: bold;
                    font-size: 12px;
                    background: rgba(255,255,255,0.2);
                    padding: 4px;
                    border-radius: 4px;
                }
                .info-section {
                    flex: 1;
                }
                .info-section h3 {
                    margin: 0 0 12px 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                .detail-row {
                    display: flex;
                    margin-bottom: 8px;
                    font-size: 12px;
                }
                .label {
                    min-width: 60px;
                    opacity: 0.8;
                }
                .value {
                    font-weight: 500;
                }
                .footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    padding: 8px;
                    text-align: center;
                }
                .barcode {
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    letter-spacing: 1px;
                }
                
                /* Back Side Styles */
                .back-header {
                    background: rgba(255,255,255,0.1);
                    padding: 12px 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                    text-align: center;
                }
                .back-header h3 {
                    margin: 0;
                    font-size: 14px;
                }
                .contact-info {
                    padding: 15px;
                    height: 150px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    font-size: 11px;
                }
                .contact-section h4 {
                    margin: 0 0 4px 0;
                    font-size: 10px;
                    opacity: 0.8;
                    text-transform: uppercase;
                }
                .contact-section p {
                    margin: 0;
                    font-weight: 500;
                }
                .back-footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    padding: 8px;
                }
                .signature-section {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                }
                .signature {
                    text-align: center;
                    font-size: 9px;
                }
                .signature img {
                    width: 40px;
                    height: 20px;
                }
                .student-sign {
                    height: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.5);
                    margin-bottom: 2px;
                }
                .school-contact {
                    text-align: center;
                    font-size: 8px;
                    opacity: 0.8;
                }
            `
        },
        thumbnail: '/images/templates/blue-double-template-thumb.png',
        preview: '/images/templates/blue-double-template-preview.png',
        version: 1
    },
    // NEW TEMPLATE 2: Minimalist White (Front Only)
    {
        name: 'Minimalist White',
        type: 'idcard',
        description: 'A clean, minimalist white ID card design',
        isDefault: false,
        hasBackPage: false,
        template: {
            html: `
                <div class="id-card">
                    <div class="top-accent"></div>
                    <div class="card-content">
                        <div class="header-section">
                            <div class="school-logo">
                                <img src="{{schoolLogo}}" alt="School Logo">
                            </div>
                            <div class="school-details">
                                <h1>{{schoolName}}</h1>
                                <p class="card-type">Student Identity Card</p>
                            </div>
                        </div>
                        
                        <div class="student-section">
                            <div class="photo-container">
                                <img src="{{studentPhoto}}" alt="Student Photo" class="student-photo">
                            </div>
                            <div class="student-info">
                                <div class="name-section">
                                    <h2>{{studentName}}</h2>
                                    <div class="id-badge">ID: {{studentId}}</div>
                                </div>
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <span class="icon">🏫</span>
                                        <span class="text">{{className}}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="icon">📅</span>
                                        <span class="text">{{dateOfBirth}}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="icon">📍</span>
                                        <span class="text">{{address}}</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="icon">📞</span>
                                        <span class="text">{{phoneNumber}}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <div class="barcode-section">
                                <div class="barcode">{{barcode}}</div>
                            </div>
                            <div class="signature-section">
                                <img src="{{principalSignature}}" alt="Signature">
                                <p>Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                .id-card {
                    width: 450px;
                    height: 280px;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    position: relative;
                }
                .top-accent {
                    height: 4px;
                    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                }
                .card-content {
                    padding: 20px;
                    height: calc(100% - 4px);
                    display: flex;
                    flex-direction: column;
                }
                .header-section {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f3f4f6;
                }
                .school-logo img {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    object-fit: cover;
                }
                .school-details {
                    margin-left: 15px;
                    flex: 1;
                }
                .school-details h1 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1f2937;
                    line-height: 1.2;
                }
                .card-type {
                    margin: 2px 0 0 0;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .student-section {
                    display: flex;
                    flex: 1;
                    gap: 20px;
                }
                .photo-container {
                    flex-shrink: 0;
                }
                .student-photo {
                    width: 90px;
                    height: 110px;
                    border-radius: 12px;
                    object-fit: cover;
                    border: 3px solid #f8fafc;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .student-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .name-section {
                    margin-bottom: 15px;
                }
                .name-section h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #111827;
                }
                .id-badge {
                    display: inline-block;
                    background: #e0e7ff;
                    color: #3730a3;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 5px;
                }
                .details-grid {
                    display: grid;
                    gap: 8px;
                }
                .detail-item {
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                    color: #374151;
                }
                .detail-item .icon {
                    margin-right: 8px;
                    font-size: 14px;
                }
                .detail-item .text {
                    font-weight: 500;
                }
                .footer-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #f3f4f6;
                }
                .barcode-section {
                    flex: 1;
                }
                .barcode {
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    color: #6b7280;
                    letter-spacing: 1px;
                }
                .signature-section {
                    text-align: center;
                }
                .signature-section img {
                    width: 60px;
                    height: 25px;
                    object-fit: contain;
                }
                .signature-section p {
                    margin: 5px 0 0 0;
                    font-size: 9px;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `
        },
        thumbnail: '/images/templates/minimalist-white-template-thumb.png',
        preview: '/images/templates/minimalist-white-template-preview.png',
        version: 1
    },
    // NEW TEMPLATE 3: Vertical Purple Card
    {
        name: 'Vertical Purple Card',
        type: 'idcard',
        description: 'A stylish vertical purple ID card design',
        isDefault: false,
        hasBackPage: false,
        template: {
            html: `
                <div class="id-card-vertical">
                    <div class="geometric-bg">
                        <div class="shape shape-1"></div>
                        <div class="shape shape-2"></div>
                        <div class="shape shape-3"></div>
                    </div>
                    
                    <div class="card-header">
                        <div class="logo-container">
                            <img src="{{schoolLogo}}" alt="School Logo" class="logo">
                        </div>
                        <h1 class="school-name">{{schoolName}}</h1>
                        <p class="card-title">STUDENT ID CARD</p>
                    </div>
                    
                    <div class="photo-section">
                        <div class="photo-frame">
                            <img src="{{studentPhoto}}" alt="Student Photo" class="student-photo">
                        </div>
                        <div class="id-number">{{studentId}}</div>
                    </div>
                    
                    <div class="info-panel">
                        <h2 class="student-name">{{studentName}}</h2>
                        
                        <div class="info-grid">
                            <div class="info-row">
                                <div class="label">Class</div>
                                <div class="value">{{className}}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">Date of Birth</div>
                                <div class="value">{{dateOfBirth}}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">Address</div>
                                <div class="value">{{address}}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">Phone</div>
                                <div class="value">{{phoneNumber}}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <div class="barcode-container">
                            <div class="barcode">{{barcode}}</div>
                        </div>
                        <div class="signature-container">
                            <img src="{{principalSignature}}" alt="Principal Signature" class="signature">
                            <p class="signature-label">Principal</p>
                        </div>
                    </div>
                </div>
            `,
            css: `
                .id-card-vertical {
                    width: 320px;
                    height: 500px;
                    background: linear-gradient(145deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    overflow: hidden;
                    position: relative;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }
                .geometric-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    z-index: 1;
                }
                .shape {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                }
                .shape-1 {
                    width: 120px;
                    height: 120px;
                    top: -60px;
                    right: -60px;
                }
                .shape-2 {
                    width: 80px;
                    height: 80px;
                    bottom: 100px;
                    left: -40px;
                    background: rgba(255,255,255,0.05);
                }
                .shape-3 {
                    width: 60px;
                    height: 60px;
                    top: 200px;
                    right: -30px;
                    background: rgba(255,255,255,0.08);
                }
                .card-header {
                    text-align: center;
                    padding: 25px 20px 15px;
                    z-index: 2;
                    position: relative;
                }
                .logo-container {
                    margin-bottom: 15px;
                }
                .logo {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: 3px solid rgba(255,255,255,0.3);
                    background: white;
                }
                .school-name {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .card-title {
                    margin: 0;
                    font-size: 11px;
                    letter-spacing: 2px;
                    opacity: 0.9;
                    font-weight: 500;
                }
                .photo-section {
                    text-align: center;
                    padding: 20px;
                    z-index: 2;
                    position: relative;
                }
                .photo-frame {
                    display: inline-block;
                    padding: 6px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 15px;
                    margin-bottom: 12px;
                }
                .student-photo {
                    width: 120px;
                    height: 150px;
                    border-radius: 10px;
                    object-fit: cover;
                    display: block;
                }
                .id-number {
                    background: rgba(0,0,0,0.3);
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 14px;
                    display: inline-block;
                }
                .info-panel {
                    padding: 20px 25px;
                    z-index: 2;
                    position: relative;
                    flex: 1;
                }
                .student-name {
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: 600;
                    text-align: center;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .info-row {
                    background: rgba(255,255,255,0.1);
                    padding: 10px 15px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                .info-row .label {
                    font-size: 11px;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }
                .info-row .value {
                    font-size: 13px;
                    font-weight: 500;
                }
                .card-footer {
                    padding: 20px;
                    background: rgba(0,0,0,0.2);
                    z-index: 2;
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .barcode-container {
                    flex: 1;
                }
                .barcode {
                    font-family: 'Courier New', monospace;
                    font-size: 9px;
                    letter-spacing: 1px;
                    opacity: 0.8;
                }
                .signature-container {
                    text-align: center;
                    margin-left: 15px;
                }
                .signature {
                    width: 50px;
                    height: 20px;
                    object-fit: contain;
                }
                .signature-label {
                    margin: 3px 0 0 0;
                    font-size: 8px;
                    opacity: 0.7;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `
        },
        thumbnail: '/images/templates/vertical-purple-template-thumb.png',
        preview: '/images/templates/vertical-purple-template-preview.png',
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
        console.log(`Successfully seeded ${createdTemplates.length} ID card templates:`);
        
        createdTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name} (${template.type}) - Default: ${template.isDefault}`);
        });

        console.log('\nTemplate details:');
        console.log('- Standard Green Template: Professional green-themed design (Default)');
        console.log('- Modern Teal Template: Modern teal-colored design');
        console.log('- Professional Blue (Front & Back): Blue design with front and back pages');
        console.log('- Minimalist White: Clean, minimalist white design');
        console.log('- Vertical Purple Card: Stylish vertical purple design');

    } catch (error) {
        console.error('Error seeding ID card templates:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

// Run the seeder
seedIdCardTemplates();