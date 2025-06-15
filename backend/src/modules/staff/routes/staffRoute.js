const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware.js');
const { checkRole } = require('../../../middleware/roleMiddleware.js');
const validate = require('../../../utils/validationUtil.js');
const staffValidation = require('../validations/staffValidation.js');
const staffController = require('../controller/staffController.js');
const upload = require('../../../utils/fileUpload.js');

router.use(authenticate);

// Staff Basic Routes
router.get('/', 
    checkRole(['admin', 'hr']), 
    validate(staffValidation.getStaffQuery),
    staffController.getAllStaff
);

router.get('/:id',
    checkRole(['admin', 'hr']),
    validate(staffValidation.idParam),
    staffController.getStaffById
);

router.post('/',
    checkRole(['admin', 'hr']),
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'documents', maxCount: 5 }
    ]),
    validate(staffValidation.createStaff),
    staffController.createStaff
);

router.put('/:id',
    checkRole(['admin', 'hr']),
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'documents', maxCount: 5 }
    ]),
    validate(staffValidation.updateStaff),
    staffController.updateStaff
);

router.delete('/:id',
    checkRole(['admin']),
    validate(staffValidation.idParam),
    staffController.deleteStaff
);

// Attendance Routes
router.post('/attendance',
    checkRole(['admin', 'hr']),
    validate(staffValidation.markAttendance),
    staffController.markAttendance
);

router.get('/attendance/:staffId',
    checkRole(['admin', 'hr', 'staff']),
    validate(staffValidation.getAttendance),
    staffController.getStaffAttendance
);

// Leave Management Routes
router.post('/leave',
    checkRole(['admin', 'hr', 'staff']),
    upload.array('documents', 3),
    validate(staffValidation.applyLeave),
    staffController.applyLeave
);

router.get('/leave/:staffId',
    checkRole(['admin', 'hr', 'staff']),
    validate(staffValidation.getLeaves),
    staffController.getStaffLeaves
);

router.put('/leave/:id',
    checkRole(['admin', 'hr']),
    validate(staffValidation.updateLeave),
    staffController.updateLeaveStatus
);

// Document Routes
router.post('/:id/documents',
    checkRole(['admin', 'hr']),
    upload.array('documents', 5),
    validate(staffValidation.uploadDocuments),
    staffController.uploadDocuments
);

router.get('/:id/documents',
    checkRole(['admin', 'hr', 'staff']),
    validate(staffValidation.idParam),
    staffController.getStaffDocuments
);

// Transport Routes
router.post('/:id/transport',
    checkRole(['admin', 'transport']),
    validate(staffValidation.assignTransport),
    staffController.assignTransportRoute
);

router.get('/:id/transport',
    checkRole(['admin', 'transport', 'staff']),
    validate(staffValidation.idParam),
    staffController.getStaffTransport
);

// Library Routes
router.post('/:id/library/issue',
    checkRole(['admin', 'librarian']),
    validate(staffValidation.issueBook),
    staffController.issueBook
);

router.post('/:id/library/return',
    checkRole(['admin', 'librarian']),
    validate(staffValidation.returnBook),
    staffController.returnBook
);

router.get('/:id/library',
    checkRole(['admin', 'librarian', 'staff']),
    validate(staffValidation.idParam),
    staffController.getStaffLibrary
);

module.exports = router;