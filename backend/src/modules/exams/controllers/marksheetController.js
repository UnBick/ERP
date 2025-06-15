const generateMarksheet = async (studentId, examId, classId, sectionId) => {
  try {
    // ... existing marksheet generation code ...

    // Verify all required signatures are available
    const signatureVerification = await verifySignaturesForDocument('MARKSHEET', classId, sectionId);
    
    if (!signatureVerification.isComplete) {
      throw new Error(`Missing required signatures: ${signatureVerification.missing.join(', ')}`);
    }

    // Get all required signatures
    const principalSignature = await Signature.findOne({ type: 'PRINCIPAL', status: 'active' });
    const examControllerSignature = await Signature.findOne({ type: 'EXAM_CONTROLLER', status: 'active' });
    const classTeacherSignature = await getClassTeacherSignature(classId, sectionId);

    // Add signatures to marksheet
    marksheetData.signatures = {
      principal: principalSignature?.imageUrl,
      examController: examControllerSignature?.imageUrl,
      classTeacher: classTeacherSignature?.imageUrl
    };

    // ... rest of the marksheet generation code ...
  } catch (error) {
    console.error('Error generating marksheet:', error);
    throw error;
  }
};
