export const TEMPLATE_TYPES = {
  REPORT_CARD: { name: 'Report Card', variables: ['studentName', 'class', 'marks'] },
  ADMISSION_LETTER: { name: 'Admission Letter', variables: ['studentName', 'parentName', 'class'] },
  TRANSFER_CERTIFICATE: { name: 'Transfer Certificate', variables: ['studentName', 'admissionNo', 'class'] },
  BONAFIDE: { name: 'Bonafide Certificate', variables: ['studentName', 'enrollmentPeriod'] },
  FEE_RECEIPT: { name: 'Fee Receipt', variables: ['studentName', 'amount', 'date'] },
  STAFF_LETTER: { name: 'Staff Letter', variables: ['staffName', 'department', 'date'] }
};

export const PREDEFINED_TEMPLATES = [
  {
    id: 'template1',
    type: 'SCHOOL_ID',
    header: 'School ID Card',
    content: 'Name: {{studentName}}\nClass: {{class}}\nSection: {{section}}\nRoll No: {{rollNo}}\nAdmission No: {{admissionNo}}',
    footer: 'School Name'
  },
  {
    id: 'template2',
    type: 'TRANSFER_CERT',
    header: 'Transfer Certificate',
    content: 'This is to certify that {{studentName}}, son/daughter of {{fatherName}}, was admitted to this school with Admission No. {{admissionNo}} and studied in Class {{class}} until {{dateOfLeaving}}.',
    footer: 'School Name'
  },
  // Add more predefined templates as needed
];

export const generateDynamicTemplate = (template, data) => {
  let content = template;
  Object.keys(data).forEach(key => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  });
  return content;
};

export const validateTemplateData = (template) => {
  const requiredFields = ['type', 'content'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!template[field]) {
      errors.push(`${field} is required`);
    }
  });

  return errors;
};
