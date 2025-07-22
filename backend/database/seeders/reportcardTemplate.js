require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const IdCardTemplate = require('../../src/modules/student/models/idCardTemplateModel');

const additionalTemplates = [
    {
        name: 'Modern Gradient Report Card',
        type: 'reportcard',
        description: 'A sleek modern report card with gradient design and progress bars',
        isDefault: false,
        template: {
            html: `
                <div class="modern-report-card">
                    <div class="gradient-header">
                        <div class="school-logo">
                            <div class="logo-circle">
                                <span class="logo-text">{{schoolInitials}}</span>
                            </div>
                        </div>
                        <div class="header-content">
                            <h1 class="school-name">{{schoolName}}</h1>
                            <p class="school-address">{{schoolAddress}}</p>
                            <h2 class="report-title">ACADEMIC REPORT</h2>
                        </div>
                        <div class="academic-year">{{schoolYear}}</div>
                    </div>

                    <div class="student-details">
                        <div class="student-photo">
                            <div class="photo-placeholder">📸</div>
                        </div>
                        <div class="student-info-grid">
                            <div class="info-item">
                                <label>Student Name</label>
                                <div class="info-value">{{studentName}}</div>
                            </div>
                            <div class="info-item">
                                <label>Class & Section</label>
                                <div class="info-value">{{className}}</div>
                            </div>
                            <div class="info-item">
                                <label>Roll Number</label>
                                <div class="info-value">{{rollNumber}}</div>
                            </div>
                            <div class="info-item">
                                <label>Class Teacher</label>
                                <div class="info-value">{{teacherName}}</div>
                            </div>
                        </div>
                    </div>

                    <div class="grades-section">
                        <h3>Academic Performance</h3>
                        <table class="modern-table">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Test 1</th>
                                    <th>Test 2</th>
                                    <th>Final</th>
                                    <th>Total</th>
                                    <th>Grade</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{#each subjects}}
                                <tr>
                                    <td class="subject-name">{{name}}</td>
                                    <td>{{term1}}</td>
                                    <td>{{term2}}</td>
                                    <td>{{term3}}</td>
                                    <td class="total-marks">{{obtained}}/{{total}}</td>
                                    <td><span class="grade-badge grade-{{grade}}">{{grade}}</span></td>
                                    <td>
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: {{percentage}}%"></div>
                                        </div>
                                    </td>
                                </tr>
                                {{/each}}
                            </tbody>
                        </table>
                    </div>

                    <div class="footer-section">
                        <div class="signature-area">
                            <div class="signature">
                                <div class="signature-line"></div>
                                <p>Class Teacher</p>
                            </div>
                            <div class="signature">
                                <div class="signature-line"></div>
                                <p>Principal</p>
                            </div>
                            <div class="signature">
                                <div class="signature-line"></div>
                                <p>Parent/Guardian</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                * { box-sizing: border-box; }
                
                body { 
                    margin: 0; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }

                .modern-report-card { 
                    max-width: 900px; 
                    margin: 0 auto; 
                    background: white; 
                    border-radius: 15px; 
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1); 
                }

                .gradient-header {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    padding: 30px;
                    color: white;
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .school-logo .logo-circle {
                    width: 80px;
                    height: 80px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: bold;
                    backdrop-filter: blur(10px);
                }

                .header-content {
                    flex: 1;
                }

                .school-name { 
                    font-size: 28px; 
                    margin: 0 0 5px 0; 
                    font-weight: 300;
                }

                .school-address {
                    margin: 0 0 15px 0;
                    opacity: 0.9;
                }

                .report-title { 
                    font-size: 32px; 
                    font-weight: bold; 
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }

                .academic-year {
                    background: rgba(255,255,255,0.2);
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    backdrop-filter: blur(10px);
                }

                .student-details {
                    padding: 30px;
                    display: flex;
                    gap: 30px;
                    background: #f8f9fc;
                }

                .student-photo {
                    width: 120px;
                    height: 120px;
                    border-radius: 15px;
                    background: #e1e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    border: 3px solid #ddd;
                }

                .student-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    flex: 1;
                }

                .info-item label {
                    display: block;
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    font-weight: bold;
                    margin-bottom: 5px;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    padding: 8px 12px;
                    background: white;
                    border-radius: 8px;
                    border: 2px solid #e1e8f0;
                }

                .grades-section {
                    padding: 30px;
                }

                .grades-section h3 {
                    margin: 0 0 20px 0;
                    font-size: 22px;
                    color: #333;
                    border-bottom: 3px solid #4facfe;
                    padding-bottom: 10px;
                }

                .modern-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                }

                .modern-table th { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 12px;
                    font-weight: 600;
                    text-align: center;
                    font-size: 14px;
                }

                .modern-table td { 
                    padding: 12px;
                    text-align: center;
                    border-bottom: 1px solid #f0f0f0;
                }

                .modern-table tbody tr:hover {
                    background: #f8f9fc;
                }

                .subject-name {
                    text-align: left !important;
                    font-weight: 600;
                    color: #333;
                }

                .total-marks {
                    font-weight: bold;
                    color: #4facfe;
                }

                .grade-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                }

                .grade-A { background: #4caf50; color: white; }
                .grade-B { background: #2196f3; color: white; }
                .grade-C { background: #ff9800; color: white; }
                .grade-D { background: #f44336; color: white; }

                .progress-bar {
                    width: 60px;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 0 auto;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #4facfe, #00f2fe);
                    transition: width 0.3s ease;
                }

                .footer-section {
                    padding: 30px;
                    background: #f8f9fc;
                    border-top: 1px solid #e1e8f0;
                }

                .signature-area {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 30px;
                }

                .signature {
                    text-align: center;
                }

                .signature-line {
                    width: 150px;
                    height: 1px;
                    background: #333;
                    margin: 0 auto 10px auto;
                }

                .signature p {
                    margin: 0;
                    font-size: 12px;
                    color: #666;
                    font-weight: 500;
                }
            `
        },
        thumbnail: '/images/templates/modern-report-card-thumb.png',
        preview: '/images/templates/modern-report-card-preview.png',
        version: 1
    },
    {
        name: 'Classic Academic Report Card',
        type: 'reportcard',
        description: 'Traditional formal report card with elegant typography and classic layout',
        isDefault: false,
        template: {
            html: `
                <div class="classic-report-card">
                    <div class="ornamental-border">
                        <div class="header-section">
                            <div class="school-crest">🎓</div>
                            <div class="school-info">
                                <h1 class="school-name">{{schoolName}}</h1>
                                <p class="school-motto">Excellence in Education</p>
                                <h2 class="document-title">STUDENT PROGRESS REPORT</h2>
                                <div class="academic-session">Academic Session: {{schoolYear}}</div>
                            </div>
                        </div>

                        <div class="student-section">
                            <div class="student-info-table">
                                <table>
                                    <tr>
                                        <td class="label">Student Name:</td>
                                        <td class="value">{{studentName}}</td>
                                        <td class="label">Class:</td>
                                        <td class="value">{{className}}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Father's Name:</td>
                                        <td class="value">{{fatherName}}</td>
                                        <td class="label">Roll No:</td>
                                        <td class="value">{{rollNumber}}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Date of Birth:</td>
                                        <td class="value">{{dateOfBirth}}</td>
                                        <td class="label">Attendance:</td>
                                        <td class="value">{{attendance}}%</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <div class="academics-section">
                            <h3 class="section-title">SCHOLASTIC AREAS</h3>
                            <table class="grades-table">
                                <thead>
                                    <tr>
                                        <th rowspan="2">SUBJECT</th>
                                        <th colspan="3">PERIODIC ASSESSMENT</th>
                                        <th rowspan="2">TOTAL<br>MARKS</th>
                                        <th rowspan="2">MARKS<br>OBTAINED</th>
                                        <th rowspan="2">GRADE</th>
                                        <th rowspan="2">REMARKS</th>
                                    </tr>
                                    <tr>
                                        <th>TERM I</th>
                                        <th>TERM II</th>
                                        <th>TERM III</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {{#each subjects}}
                                    <tr>
                                        <td class="subject-cell">{{name}}</td>
                                        <td>{{term1}}</td>
                                        <td>{{term2}}</td>
                                        <td>{{term3}}</td>
                                        <td class="total-cell">{{total}}</td>
                                        <td class="obtained-cell">{{obtained}}</td>
                                        <td class="grade-cell">{{grade}}</td>
                                        <td class="remarks-cell">{{remarks}}</td>
                                    </tr>
                                    {{/each}}
                                </tbody>
                            </table>
                        </div>

                        <div class="summary-section">
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <label>Total Marks:</label>
                                    <span>{{totalMarks}}</span>
                                </div>
                                <div class="summary-item">
                                    <label>Marks Obtained:</label>
                                    <span>{{marksObtained}}</span>
                                </div>
                                <div class="summary-item">
                                    <label>Percentage:</label>
                                    <span>{{percentage}}%</span>
                                </div>
                                <div class="summary-item">
                                    <label>Overall Grade:</label>
                                    <span class="overall-grade">{{overallGrade}}</span>
                                </div>
                            </div>
                        </div>

                        <div class="remarks-section">
                            <h4>Class Teacher's Remarks:</h4>
                            <div class="remarks-box">{{teacherRemarks}}</div>
                        </div>

                        <div class="signatures-section">
                            <div class="signature-block">
                                <div class="signature-space"></div>
                                <div class="signature-label">Class Teacher</div>
                                <div class="signature-name">{{teacherName}}</div>
                            </div>
                            <div class="signature-block">
                                <div class="signature-space"></div>
                                <div class="signature-label">Principal</div>
                                <div class="signature-name">Dr. {{principalName}}</div>
                            </div>
                            <div class="signature-block">
                                <div class="signature-space"></div>
                                <div class="signature-label">Parent's Signature</div>
                                <div class="signature-name">Date: _______</div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                body { 
                    margin: 0; 
                    font-family: 'Times New Roman', serif; 
                    background: #f5f5f0; 
                    padding: 20px;
                }

                .classic-report-card { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    background: white; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                }

                .ornamental-border {
                    border: 8px double #8B4513;
                    margin: 20px;
                    padding: 30px;
                    position: relative;
                }

                .ornamental-border::before {
                    content: '';
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    right: 15px;
                    bottom: 15px;
                    border: 2px solid #8B4513;
                    pointer-events: none;
                }

                .header-section { 
                    text-align: center; 
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #8B4513;
                }

                .school-crest {
                    font-size: 48px;
                    margin-bottom: 10px;
                }

                .school-name { 
                    font-size: 28px; 
                    margin: 10px 0 5px 0; 
                    color: #8B4513;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .school-motto {
                    font-style: italic;
                    color: #666;
                    margin: 0 0 20px 0;
                    font-size: 14px;
                }

                .document-title { 
                    font-size: 24px; 
                    color: #000; 
                    margin: 15px 0;
                    font-weight: bold;
                    text-decoration: underline;
                }

                .academic-session {
                    background: #8B4513;
                    color: white;
                    padding: 8px 20px;
                    display: inline-block;
                    font-weight: bold;
                }

                .student-section {
                    margin: 25px 0;
                }

                .student-info-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .student-info-table td {
                    padding: 8px 15px;
                    border: 1px solid #8B4513;
                }

                .student-info-table .label {
                    background: #f9f9f9;
                    font-weight: bold;
                    width: 20%;
                }

                .student-info-table .value {
                    width: 30%;
                    font-weight: normal;
                }

                .academics-section {
                    margin: 25px 0;
                }

                .section-title {
                    background: #8B4513;
                    color: white;
                    padding: 10px;
                    margin: 0 0 15px 0;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 1px;
                }

                .grades-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    border: 2px solid #8B4513;
                }

                .grades-table th { 
                    background: #8B4513; 
                    color: white;
                    padding: 10px 8px;
                    font-weight: bold;
                    text-align: center;
                    font-size: 12px;
                    border: 1px solid white;
                }

                .grades-table td { 
                    border: 1px solid #8B4513; 
                    padding: 8px;
                    text-align: center;
                    font-size: 12px;
                }

                .subject-cell {
                    text-align: left !important;
                    font-weight: bold;
                    background: #f9f9f9;
                }

                .grade-cell {
                    font-weight: bold;
                    color: #8B4513;
                }

                .total-cell, .obtained-cell {
                    font-weight: bold;
                }

                .summary-section {
                    margin: 25px 0;
                    border: 2px solid #8B4513;
                    background: #f9f9f9;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr;
                    gap: 0;
                }

                .summary-item {
                    padding: 15px;
                    border-right: 1px solid #8B4513;
                    text-align: center;
                }

                .summary-item:last-child {
                    border-right: none;
                }

                .summary-item label {
                    display: block;
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #8B4513;
                    font-size: 12px;
                }

                .summary-item span {
                    font-size: 18px;
                    font-weight: bold;
                }

                .overall-grade {
                    color: #8B4513 !important;
                    font-size: 24px !important;
                }

                .remarks-section {
                    margin: 25px 0;
                }

                .remarks-section h4 {
                    margin: 0 0 10px 0;
                    color: #8B4513;
                    font-size: 14px;
                }

                .remarks-box {
                    border: 2px solid #8B4513;
                    min-height: 60px;
                    padding: 15px;
                    background: #fafafa;
                    font-style: italic;
                }

                .signatures-section {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #8B4513;
                }

                .signature-block {
                    text-align: center;
                    flex: 1;
                    margin: 0 10px;
                }

                .signature-space {
                    height: 50px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                }

                .signature-label {
                    font-weight: bold;
                    font-size: 12px;
                    color: #8B4513;
                    margin-bottom: 5px;
                }

                .signature-name {
                    font-size: 11px;
                    color: #666;
                }
            `
        },
        thumbnail: '/images/templates/classic-report-card-thumb.png',
        preview: '/images/templates/classic-report-card-preview.png',
        version: 1
    },
    {
        name: 'Creative Colorful Report Card',
        type: 'reportcard',
        description: 'Vibrant and engaging report card design perfect for elementary students',
        isDefault: false,
        template: {
            html: `
                <div class="colorful-report-card">
                    <div class="rainbow-header">
                        <div class="header-decoration">
                            <div class="star">⭐</div>
                            <div class="star">⭐</div>
                            <div class="star">⭐</div>
                        </div>
                        <h1 class="school-name">{{schoolName}}</h1>
                        <h2 class="report-title">🎨 STUDENT REPORT CARD 🎨</h2>
                        <div class="academic-year-badge">{{schoolYear}}</div>
                    </div>

                    <div class="student-profile">
                        <div class="profile-card">
                            <div class="profile-avatar">
                                <div class="avatar-placeholder">👦</div>
                            </div>
                            <div class="profile-info">
                                <h3>{{studentName}}</h3>
                                <div class="info-tags">
                                    <span class="tag class-tag">📚 {{className}}</span>
                                    <span class="tag teacher-tag">👨‍🏫 {{teacherName}}</span>
                                    <span class="tag roll-tag">🎯 Roll: {{rollNumber}}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="subjects-grid">
                        {{#each subjects}}
                        <div class="subject-card subject-{{@index}}">
                            <div class="subject-icon">{{icon}}</div>
                            <h4>{{name}}</h4>
                            <div class="scores">
                                <div class="score-item">
                                    <span class="score-label">Test 1</span>
                                    <span class="score-value">{{term1}}</span>
                                </div>
                                <div class="score-item">
                                    <span class="score-label">Test 2</span>
                                    <span class="score-value">{{term2}}</span>
                                </div>
                                <div class="score-item">
                                    <span class="score-label">Final</span>
                                    <span class="score-value">{{term3}}</span>
                                </div>
                            </div>
                            <div class="grade-display">
                                <span class="grade-letter">{{grade}}</span>
                                <span class="grade-percentage">{{obtained}}/{{total}}</span>
                            </div>
                            <div class="achievement-stars">
                                {{#times (gradeStars grade)}}⭐{{/times}}
                            </div>
                        </div>
                        {{/each}}
                    </div>

                    <div class="performance-summary">
                        <div class="summary-card overall-card">
                            <div class="summary-icon">🏆</div>
                            <h4>Overall Performance</h4>
                            <div class="overall-grade">{{overallGrade}}</div>
                            <div class="percentage-circle">
                                <div class="circle">
                                    <div class="percentage">{{percentage}}%</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="summary-card attendance-card">
                            <div class="summary-icon">📅</div>
                            <h4>Attendance</h4>
                            <div class="attendance-bar">
                                <div class="attendance-fill" style="width: {{attendance}}%"></div>
                            </div>
                            <div class="attendance-text">{{attendance}}% Present</div>
                        </div>
                    </div>

                    <div class="teacher-notes">
                        <div class="notes-header">
                            <span class="notes-icon">💭</span>
                            <h4>Teacher's Comments</h4>
                        </div>
                        <div class="notes-content">
                            {{teacherComments}}
                        </div>
                    </div>

                    <div class="celebration-footer">
                        <div class="achievement-badges">
                            <div class="badge good-work">👍 Good Work!</div>
                            <div class="badge keep-it-up">🌟 Keep It Up!</div>
                            <div class="badge excellent">🎉 Excellent!</div>
                        </div>
                        <div class="signature-section">
                            <div class="signature-line">
                                <span>Teacher: ________________</span>
                            </div>
                            <div class="signature-line">
                                <span>Parent: ________________</span>
                            </div>
                            <div class="signature-line">
                                <span>Date: ________________</span>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            css: `
                body { 
                margin: 0; 
                font-family: 'Comic Sans MS', cursive, sans-serif; 
                background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
                min-height: 100vh;
                padding: 15px;
            }

            .colorful-report-card { 
                max-width: 900px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 20px; 
                overflow: hidden;
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                border: 5px solid #ff6b6b;
            }

            .rainbow-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
                padding: 30px;
                text-align: center;
                color: white;
                position: relative;
                overflow: hidden;
            }

            .header-decoration {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-bottom: 15px;
            }

            .star {
                font-size: 24px;
                animation: twinkle 2s infinite alternate;
            }

            @keyframes twinkle {
                0% { opacity: 0.5; transform: scale(1); }
                100% { opacity: 1; transform: scale(1.2); }
            }

            .school-name {
                font-size: 28px;
                margin: 0 0 10px 0;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .report-title {
                font-size: 24px;
                margin: 0 0 15px 0;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .academic-year-badge {
                background: rgba(255,255,255,0.3);
                padding: 8px 20px;
                border-radius: 25px;
                display: inline-block;
                font-weight: bold;
                backdrop-filter: blur(10px);
            }

            .student-profile {
                padding: 25px;
                background: #f8f9fc;
            }

            .profile-card {
                background: white;
                border-radius: 15px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                border: 3px solid #ff6b6b;
            }

            .profile-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ffeaa7, #fab1a0);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                border: 3px solid #ff6b6b;
            }

            .profile-info h3 {
                margin: 0 0 15px 0;
                font-size: 24px;
                color: #2d3436;
                font-weight: bold;
            }

            .info-tags {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .tag {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }

            .class-tag { background: #74b9ff; }
            .teacher-tag { background: #fd79a8; }
            .roll-tag { background: #55a3ff; }

            .subjects-grid {
                padding: 25px;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }

            .subject-card {
                background: white;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                border-left: 5px solid;
            }

            .subject-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }

            .subject-0 { border-left-color: #ff7675; }
            .subject-1 { border-left-color: #74b9ff; }
            .subject-2 { border-left-color: #55a3ff; }
            .subject-3 { border-left-color: #fd79a8; }
            .subject-4 { border-left-color: #fdcb6e; }
            .subject-5 { border-left-color: #6c5ce7; }

            .subject-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 10px;
            }

            .subject-card h4 {
                text-align: center;
                margin: 0 0 15px 0;
                font-size: 18px;
                color: #2d3436;
                font-weight: bold;
            }

            .scores {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
            }

            .score-item {
                text-align: center;
                flex: 1;
            }

            .score-label {
                display: block;
                font-size: 10px;
                color: #636e72;
                margin-bottom: 3px;
                font-weight: bold;
            }

            .score-value {
                display: block;
                font-size: 14px;
                font-weight: bold;
                color: #2d3436;
                background: #f8f9fc;
                padding: 4px 8px;
                border-radius: 8px;
            }

            .grade-display {
                text-align: center;
                margin-bottom: 10px;
            }

            .grade-letter {
                font-size: 36px;
                font-weight: bold;
                color: #2d3436;
                display: block;
            }

            .grade-percentage {
                font-size: 12px;
                color: #636e72;
            }

            .achievement-stars {
                text-align: center;
                font-size: 16px;
            }

            .performance-summary {
                padding: 25px;
                background: #f8f9fc;
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
            }

            .summary-card {
                background: white;
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }

            .overall-card {
                border: 3px solid #00b894;
            }

            .attendance-card {
                border: 3px solid #0984e3;
            }

            .summary-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }

            .summary-card h4 {
                margin: 0 0 15px 0;
                color: #2d3436;
                font-size: 18px;
            }

            .overall-grade {
                font-size: 48px;
                font-weight: bold;
                color: #00b894;
                margin-bottom: 15px;
            }

            .percentage-circle {
                margin: 0 auto;
            }

            .circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: conic-gradient(#00b894 0deg, #00b894 var(--percentage, 0deg), #e0e0e0 var(--percentage, 0deg));
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .circle::before {
                content: '';
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: white;
                position: absolute;
            }

            .percentage {
                font-size: 16px;
                font-weight: bold;
                color: #2d3436;
                z-index: 1;
            }

            .attendance-bar {
                width: 100%;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .attendance-fill {
                height: 100%;
                background: linear-gradient(90deg, #0984e3, #74b9ff);
                transition: width 0.3s ease;
            }

            .attendance-text {
                font-size: 16px;
                font-weight: bold;
                color: #0984e3;
            }

            .teacher-notes {
                padding: 25px;
                background: white;
            }

            .notes-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }

            .notes-icon {
                font-size: 24px;
            }

            .notes-header h4 {
                margin: 0;
                color: #2d3436;
                font-size: 18px;
            }

            .notes-content {
                background: #f8f9fc;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #fd79a8;
                min-height: 60px;
                font-size: 14px;
                line-height: 1.6;
                color: #2d3436;
            }

            .celebration-footer {
                background: linear-gradient(135deg, #ffeaa7, #fab1a0);
                padding: 25px;
                text-align: center;
            }

            .achievement-badges {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-bottom: 25px;
                flex-wrap: wrap;
            }

            .badge {
                background: white;
                padding: 8px 16px;
                border-radius: 25px;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                border: 2px solid;
            }

            .good-work { border-color: #00b894; color: #00b894; }
            .keep-it-up { border-color: #fdcb6e; color: #fdcb6e; }
            .excellent { border-color: #fd79a8; color: #fd79a8; }

            .signature-section {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 20px;
            }

            .signature-line {
                text-align: center;
            }

            .signature-line span {
                font-size: 14px;
                font-weight: bold;
                color: #2d3436;
                border-bottom: 2px solid #2d3436;
                padding-bottom: 2px;
            }

            @media (max-width: 768px) {
                .subjects-grid {
                    grid-template-columns: 1fr;
                }
                
                .performance-summary {
                    grid-template-columns: 1fr;
                }
                
                .profile-card {
                    flex-direction: column;
                    text-align: center;
                }
                
                .achievement-badges {
                    flex-direction: column;
                    align-items: center;
                }
                
                .signature-section {
                    flex-direction: column;
                    align-items: center;
                }
            `
        },
        thumbnail: '/images/templates/colorful-report-card-thumb.png',
        preview: '/images/templates/colorful-report-card-preview.png',
        version: 1
    }
];

const seedAdditionalReportCardTemplates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Insert additional templates (keeping existing ones)
        const createdTemplates = await IdCardTemplate.insertMany(additionalTemplates);
        console.log(`Created ${createdTemplates.length} additional report card templates`);

        // Log the created templates
        createdTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.name} (${template.type})`);
        });

        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error seeding additional report card templates:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

// Handle interruptions
process.on('SIGINT', async () => {
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(0);
});

seedAdditionalReportCardTemplates();