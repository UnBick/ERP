export const TEACHER_ROLES = {
    CLASS_TEACHER: 'classTeacher',
    SUBJECT_TEACHER: 'subjectTeacher'
};

export const EXAM_TYPES = {
    UNIT_TEST: { name: 'Unit Test', autoPublish: true },
    MID_TERM: { name: 'Mid Term', autoPublish: false },
    FINAL: { name: 'Final', autoPublish: false }
};

export const AUTO_PUBLISH_EXAMS = ['UNIT_TEST'];
