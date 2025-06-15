const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const templateFieldMappers = {
    reportcard: (data) => ({
        schoolName: data.schoolName || 'School Name',
        schoolLogo: data.schoolLogo || '/default-logo.png',
        studentName: data.studentName || 'N/A',
        className: data.className || 'N/A',
        schoolYear: data.schoolYear || new Date().getFullYear(),
        teacherName: data.teacherName || 'Not Assigned',
        subjects: Array.isArray(data.subjects) ? data.subjects.map(subject => ({
            name: subject.name || 'N/A',
            term1: subject.term1 || '-',
            term2: subject.term2 || '-',
            term3: subject.term3 || '-',
            total: subject.total || '-',
            obtained: subject.obtained || '-',
            grade: subject.grade || '-'
        })) : []
    }),

    idcard: (data) => ({
        schoolName: data.schoolName || 'School Name',
        schoolLogo: data.schoolLogo || '/default-logo.png',
        studentName: data.studentName || 'N/A',
        studentId: data.studentId || 'N/A',
        className: data.className || 'N/A',
        dateOfBirth: formatDate(data.dateOfBirth),
        validUntil: formatDate(data.validUntil),
        studentPhoto: data.studentPhoto || '/default-student.png',
        barcode: data.studentId || 'N/A',
        bloodGroup: data.bloodGroup || 'N/A',
        emergencyContact: data.emergencyContact || 'N/A'
    }),

    certificate: (data) => ({
        schoolName: data.schoolName || 'School Name',
        schoolLogo: data.schoolLogo || '/default-logo.png',
        studentName: data.studentName || 'N/A',
        className: data.className || 'N/A',
        certificateType: data.certificateType || 'General Certificate',
        issueDate: formatDate(data.issueDate || new Date()),
        certificateId: data.certificateId || `CERT${Date.now()}`,
        principalName: data.principalName || 'Principal Name',
        principalSignature: data.principalSignature || '/signatures/principal.png',
        schoolStamp: data.schoolStamp || '/stamps/school.png'
    })
};

module.exports = {
    mapTemplateFields: (type, data) => {
        const mapper = templateFieldMappers[type.toLowerCase()];
        if (!mapper) {
            throw new Error(`No field mapper found for template type: ${type}`);
        }
        return mapper(data);
    }
};
