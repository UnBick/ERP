const FIELD_MAPPINGS = {
    // Personal Information
    studentName: ['studentName', 'name', 'fullName', 'student_name'],
    studentId: ['studentId', 'enrollmentNumber', 'admissionNumber', 'id', 'student_id'],
    studentPhoto: ['studentPhoto', 'photo', 'profilePhoto', 'image'],
    dateOfBirth: ['dateOfBirth', 'dob', 'birth_date'],
    gender: ['gender', 'sex'],
    religion: ['religion'],
    category: ['category', 'caste'],
    nationality: ['nationality'],
    bloodGroup: ['bloodGroup', 'blood_group'],
    motherTongue: ['motherTongue', 'mother_tongue'],

    // Academic Information
    className: ['className', 'class', 'grade', 'standard'],
    sectionName: ['sectionName', 'section', 'division'],
    rollNumber: ['rollNumber', 'roll_no', 'roll'],
    academicYear: ['academicYear', 'year', 'session'],
    admissionDate: ['admissionDate', 'dateOfAdmission', 'joining_date'],

    // Contact Information
    address: ['address', 'residentialAddress', 'permanent_address'],
    phoneNumber: ['phoneNumber', 'contact', 'mobile', 'phone'],
    email: ['email', 'emailId', 'mail'],
    
    // Guardian Information
    guardianName: ['guardianName', 'parent_name', 'fatherName', 'motherName'],
    guardianContact: ['guardianContact', 'parent_contact', 'emergency_contact'],
    guardianRelation: ['guardianRelation', 'relation', 'relationship'],

    // School Information
    schoolName: ['schoolName', 'institution', 'institute_name'],
    schoolLogo: ['schoolLogo', 'logo', 'instituteLogo'],
    teacherName: ['teacherName', 'classTeacher', 'teacher'],
    principalSignature: ['principalSignature', 'signature', 'authorizedSignature'],

    // Additional Fields
    barcode: ['barcode', 'qrCode', 'code'],
    validUntil: ['validUntil', 'validityDate', 'expiry']
};

function mapStudentData(student, templateFields) {
    const mappedData = {};

    templateFields.forEach(field => {
        let value = 'N/A';

        // Find the corresponding mapping
        const mappingKey = Object.keys(FIELD_MAPPINGS).find(key => 
            FIELD_MAPPINGS[key].some(alias => alias.toLowerCase() === field.toLowerCase())
        );

        if (mappingKey) {
            // Extract value based on nested path
            switch (mappingKey) {
                case 'studentName':
                    value = student.personalInfo ? 
                        `${student.personalInfo.firstName || ''} ${student.personalInfo.lastName || ''}`.trim() : 'N/A';
                    break;

                case 'className':
                    value = student.academicInfo ? 
                        `${student.academicInfo.class?.name || ''} ${student.academicInfo.section?.name || ''}`.trim() : 'N/A';
                    break;

                case 'dateOfBirth':
                    value = student.personalInfo?.dateOfBirth ? 
                        new Date(student.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A';
                    break;

                // Handle nested paths
                case 'studentId':
                    value = student.enrollmentNumber || student.academicInfo?.admissionNumber || 'N/A';
                    break;

                case 'phoneNumber':
                    value = student.contactInfo?.phone || student.contactInfo?.alternateContact || 'N/A';
                    break;

                // Add other specific mappings as needed
                default:
                    // Try to find the value in different locations
                    value = student.personalInfo?.[mappingKey] ||
                           student.academicInfo?.[mappingKey] ||
                           student.contactInfo?.[mappingKey] ||
                           student[mappingKey] ||
                           'N/A';
            }
        }

        mappedData[field] = value;
    });

    // Add school information
    mappedData.schoolName = mappedData.schoolName || 'Your School Name';
    mappedData.schoolLogo = mappedData.schoolLogo || '/path/to/logo';
    mappedData.principalSignature = mappedData.principalSignature || '/path/to/signature';

    return mappedData;
}

module.exports = { mapStudentData };
