const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const salaryController = require('../controllers/salaryController');
const salaryValidation = require('../validations/salaryValidation');

router.use(authenticate);
router.use(checkRole(['admin', 'accountant']));

router.get('/', salaryController.getAllSalaries);
router.post('/', validate(salaryValidation.create), salaryController.createSalary);
router.put('/:id', validate(salaryValidation.update), salaryController.updateSalary);
router.delete('/:id', salaryController.deleteSalary);

module.exports = router;