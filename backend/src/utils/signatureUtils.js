const Signature = require('../modules/settings/models/Signature');
const StaffDocument = require('../modules/staff/models/StaffDocument');

const verifySignaturesForDocument = async (documentType, classId, sectionId) => {
  const requiredSignatures = DOCUMENT_TYPES[documentType] || [];
  let query = {
    type: { $in: requiredSignatures.filter(type => type !== 'CLASS_TEACHER') },
    status: 'active'
  };

  // Check official signatures
  const officialSignatures = await Signature.find(query);

  // Special handling for documents requiring class teacher signature
  let hasTeacherSignature = true;
  if (requiredSignatures.includes('CLASS_TEACHER')) {
    if (!classId || !sectionId) {
      throw new Error('Class and section IDs are required for documents needing class teacher signature');
    }

    // Check for class teacher signature
    hasTeacherSignature = await StaffDocument.exists({
      type: 'SIGNATURE',
      status: 'active',
      'staffDetails.classId': classId,
      'staffDetails.sectionId': sectionId,
      'staffDetails.role': 'CLASS_TEACHER'
    });
  }

  return {
    isComplete: officialSignatures.length === (requiredSignatures.length - (requiredSignatures.includes('CLASS_TEACHER') ? 1 : 0)) && hasTeacherSignature,
    available: [
      ...officialSignatures.map(sig => sig.type),
      ...(hasTeacherSignature ? ['CLASS_TEACHER'] : [])
    ],
    missing: [
      ...requiredSignatures.filter(required => 
        required !== 'CLASS_TEACHER' && !officialSignatures.some(sig => sig.type === required)
      ),
      ...((!hasTeacherSignature && requiredSignatures.includes('CLASS_TEACHER')) ? ['CLASS_TEACHER'] : [])
    ]
  };
};

// Add helper function to get class teacher signature
const getClassTeacherSignature = async (classId, sectionId) => {
  const teacherDoc = await StaffDocument.findOne({
    type: 'SIGNATURE',
    status: 'active',
    'staffDetails.classId': classId,
    'staffDetails.sectionId': sectionId,
    'staffDetails.role': 'CLASS_TEACHER'
  }).populate('staffId', 'name');

  return teacherDoc ? {
    imageUrl: teacherDoc.fileUrl,
    teacherName: teacherDoc.staffId.name,
    uploadDate: teacherDoc.updatedAt
  } : null;
};

module.exports = {
  verifySignaturesForDocument,
  getClassTeacherSignature
};
