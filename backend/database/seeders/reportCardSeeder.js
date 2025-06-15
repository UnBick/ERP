require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const IdCardTemplate = require('../../src/modules/student/models/idCardTemplateModel');

const templates = [
    {
        name: 'Standard Report Card Template',
        type: 'reportcard',
        description: 'A professional report card template with cloud design',
        isDefault: true,
        template: {
            html: `
                <div class="report-card">
                    <div class="header">
                        <div class="top-clouds">
                            <div class="cloud"></div>
                            <div class="cloud"></div>
                            <div class="sun"></div>
                        </div>
                        <h1 class="school-name">{{schoolName}}</h1>
                        <h2 class="report-title">REPORT CARD</h2>
                    </div>

                    <div class="student-info">
                        <div class="info-row">
                            <span>Student Name:</span>
                            <span class="underline">{{studentName}}</span>
                            <span>Class/Section:</span>
                            <span class="underline">{{className}}</span>
                        </div>
                        <div class="info-row">
                            <span>School Year:</span>
                            <span class="underline">{{schoolYear}}</span>
                            <span>Teacher's Name:</span>
                            <span class="underline">{{teacherName}}</span>
                        </div>
                    </div>

                    <table class="subject-table">
                        <thead>
                            <tr>
                                <th>SUBJECTS</th>
                                <th>1st Term</th>
                                <th>2nd Term</th>
                                <th>3rd Term</th>
                                <th>Total</th>
                                <th>Obtained</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {{#each subjects}}
                            <tr>
                                <td>{{name}}</td>
                                <td>{{term1}}</td>
                                <td>{{term2}}</td>
                                <td>{{term3}}</td>
                                <td>{{total}}</td>
                                <td>{{obtained}}</td>
                                <td>{{grade}}</td>
                            </tr>
                            {{/each}}
                        </tbody>
                    </table>
                </div>
            `,
            css: `
                body { 
                    margin: 0; 
                    font-family: Arial, sans-serif; 
                    background: #e8f0fe; 
                }

                .report-card { 
                    width: 80%; 
                    margin: 30px auto; 
                    padding: 20px; 
                    background: white; 
                    border-radius: 10px; 
                    box-shadow: 0 0 10px rgba(0,0,0,0.1); 
                    border-left: 20px solid #003f8a; 
                    position: relative; 
                }

                .header { 
                    text-align: center; 
                    position: relative; 
                    margin-bottom: 20px; 
                }

                .school-name { 
                    font-size: 24px; 
                    margin: 0; 
                }

                .report-title { 
                    font-size: 30px; 
                    font-weight: bold; 
                    color: #003f8a; 
                    margin: 10px 0; 
                }

                .top-clouds { 
                    position: absolute; 
                    right: 20px; 
                    top: 10px; 
                    display: flex; 
                    gap: 10px; 
                }

                .cloud, .sun { 
                    width: 30px; 
                    height: 30px; 
                    background: #fff; 
                    border-radius: 50%; 
                    box-shadow: inset 5px 5px 10px #ccc; 
                }

                .sun { 
                    background: yellow; 
                    box-shadow: 0 0 10px orange; 
                }

                .student-info { 
                    margin: 20px 0; 
                }

                .info-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 10px 0; 
                }

                .underline { 
                    flex-grow: 1; 
                    border-bottom: 1px solid #000; 
                    margin: 0 10px; 
                }

                .subject-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                    text-align: center; 
                }

                .subject-table th, .subject-table td { 
                    border: 1px solid #999; 
                    padding: 8px; 
                }

                .subject-table thead { 
                    background-color: #d0e1fd; 
                    font-weight: bold; 
                }
            `
        },
        thumbnail: '/images/templates/report-card-thumb.png',
        preview: '/images/templates/report-card-preview.png',
        version: 1
    }
];

const seedReportCardTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing templates of type reportcard
        await IdCardTemplate.deleteMany({ type: 'reportcard' });
        console.log('Cleared existing report card templates');

        // Insert new templates
        const createdTemplates = await IdCardTemplate.insertMany(templates);
        console.log(`Created ${createdTemplates.length} report card templates`);

        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error seeding report card templates:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

// Handle interruptions
process.on('SIGINT', async () => {
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(0);
});

seedReportCardTemplates();
