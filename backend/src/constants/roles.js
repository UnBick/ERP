const ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent'
};

const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: ['all'],
    [ROLES.TEACHER]: [
        'view_students',
        'manage_attendance',
        'manage_grades',
        'manage_assignments',
        'view_timetable',
        'manage_syllabus'
    ],
    [ROLES.STUDENT]: [
        'view_assignments',
        'view_grades',
        'view_timetable',
        'view_attendance',
        'access_library'
    ],
    [ROLES.PARENT]: [
        'view_child_grades',
        'view_child_attendance',
        'view_child_timetable',
        'view_fees'
    ]
};

module.exports = {
    ROLES,
    ROLE_PERMISSIONS
};
