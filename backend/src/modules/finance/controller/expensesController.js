const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Expense = require('../models/Expense');

exports.getAllExpenses = catchAsync(async (req, res) => {
    const expenses = await Expense.find()
        .populate('approvedBy', 'name')
        .sort('-date');
    res.json(ApiResponse.success('Expenses retrieved successfully', expenses));
});

exports.addExpense = catchAsync(async (req, res) => {
    const expense = await Expense.create({
        ...req.body,
        receiptNumber: `EXP-${Date.now()}`,
        approvedBy: req.user._id
    });
    res.status(201).json(ApiResponse.success('Expense added successfully', expense));
});

exports.updateExpense = catchAsync(async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });
    
    if (!expense) {
        return res.status(404).json(ApiResponse.error('Expense not found'));
    }
    
    res.json(ApiResponse.success('Expense updated successfully', expense));
});

exports.deleteExpense = catchAsync(async (req, res) => {
    const { id } = req.params;
    const expense = await Expense.findById(id);
    
    if (!expense) {
        return res.status(404).json(ApiResponse.error('Expense not found'));
    }
    
    await expense.remove();
    res.json(ApiResponse.success('Expense deleted successfully'));
});

exports.getExpenseCategories = catchAsync(async (req, res) => {
    const categories = ['utilities', 'supplies', 'maintenance', 'salary', 'transport', 'other'];
    res.json(ApiResponse.success('Categories retrieved successfully', categories));
});

exports.getExpenseReport = catchAsync(async (req, res) => {
    const { startDate, endDate, category } = req.query;
    
    const query = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };
    
    if (category) {
        query.category = category;
    }
    
    const expenses = await Expense.find(query)
        .populate('approvedBy', 'name')
        .sort('date');
        
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json(ApiResponse.success('Expense report generated successfully', {
        expenses,
        total,
        period: { startDate, endDate }
    }));
});