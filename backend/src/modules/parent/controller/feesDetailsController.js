const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Fee = require('../../fees/models/feeModel');
const Payment = require('../../fees/models/paymentModel');
const Parent = require('../models/parentModel');
const Student = require('../../student/models/studentModel');
const { generatePDF } = require('../../../utils/pdfGenerator');

exports.getFeesDetails = catchAsync(async (req, res) => {
    const { studentId } = req.params;

    // Verify parent has access to this student
    const parent = await Parent.findOne({ 
        user: req.user._id,
        children: studentId 
    });

    if (!parent) {
        return res.status(403).json(
            ApiResponse.error('Not authorized to view these fees details')
        );
    }

    const fees = await Fee.find({ student: studentId })
        .populate('type')
        .populate('student', 'personalInfo.firstName personalInfo.lastName')
        .sort({ dueDate: 1 });

    const payments = await Payment.find({ student: studentId })
        .sort({ createdAt: -1 });

    // Calculate summary
    const summary = {
        totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
        paidFees: payments.reduce((sum, payment) => sum + payment.amount, 0),
        pendingFees: 0,
        nextDueDate: fees.find(f => f.status === 'pending')?.dueDate
    };
    summary.pendingFees = summary.totalFees - summary.paidFees;

    res.json(ApiResponse.success('Fees details retrieved successfully', {
        fees,
        payments,
        summary
    }));
});

exports.getPendingFees = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const pendingFees = await Fee.find({
        student: studentId,
        status: 'pending'
    }).populate('type');

    res.json(ApiResponse.success('Pending fees retrieved', pendingFees));
});

exports.getPaymentHistory = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const history = await Payment.find({ student: studentId })
        .populate('fee')
        .sort({ createdAt: -1 });

    res.json(ApiResponse.success('Payment history retrieved', history));
});

exports.initiatePayment = catchAsync(async (req, res) => {
    const { studentId, feeId, amount, method } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee || fee.student.toString() !== studentId) {
        return res.status(404).json(
            ApiResponse.error('Invalid fee details')
        );
    }

    // Here you would integrate with your payment gateway
    // This is a mock response
    const paymentIntent = {
        id: 'pi_' + Math.random().toString(36).substr(2, 9),
        amount: amount,
        currency: 'inr',
        status: 'requires_payment_method'
    };

    res.json(ApiResponse.success('Payment initiated', { paymentIntent }));
});

exports.confirmPayment = catchAsync(async (req, res) => {
    const { studentId, feeId, paymentIntentId, amount } = req.body;

    const payment = await Payment.create({
        student: studentId,
        fee: feeId,
        amount,
        paymentId: paymentIntentId,
        method: 'online',
        status: 'successful'
    });

    // Update fee status
    await Fee.findByIdAndUpdate(feeId, {
        $inc: { paidAmount: amount },
        $set: { status: 'paid' }
    });

    res.json(ApiResponse.success('Payment confirmed', payment));
});

exports.downloadReceipt = catchAsync(async (req, res) => {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
        .populate('student')
        .populate('fee');

    if (!payment) {
        return res.status(404).json(
            ApiResponse.error('Payment record not found')
        );
    }

    const receiptData = {
        receiptNo: payment._id,
        date: payment.createdAt,
        studentName: `${payment.student.personalInfo.firstName} ${payment.student.personalInfo.lastName}`,
        amount: payment.amount,
        feeType: payment.fee.type,
        paymentMethod: payment.method
    };

    const pdf = await generatePDF('receipt', receiptData);
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt_${paymentId}.pdf`
    });
    res.send(pdf);
});