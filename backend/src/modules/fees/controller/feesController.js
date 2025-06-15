const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const FeeStructure = require('../models/FeeStructure');
const FeeAdjustment = require('../models/FeeAdjustment');
const TransportFee = require('../models/TransportFee');
const Fee = require('../models/feeModel');
const FeeCollection = require('../models/feeCollectionModel');
const LateFee = require('../models/Latefee');
const FeeWaiver = require('../models/FeeWaiver');
const PaymentGatewaySettings = require('../models/PaymentGatewaySettings');

// Main controller object
const feesController = {
    // Get all fee collections
    getFeeCollections: catchAsync(async (req, res) => {
        console.log('Getting fee collections');
        const collections = await FeeCollection.find()
            .populate('student', 'name class')
            .populate('collectedBy', 'name')
            .sort('-createdAt');

        return res.status(200).json({
            success: true,
            message: 'Fee collections retrieved successfully',
            data: collections
        });
    }),

    // Create new fee collection
    createFeeCollection: catchAsync(async (req, res) => {
        const collection = await FeeCollection.create({
            ...req.body,
            collectedBy: req.user._id,
            receiptNumber: `FEE${Date.now()}`
        });

        return res.status(201).json({
            success: true,
            message: 'Fee collection created successfully',
            data: collection
        });
    }),

    // Update fee collection
    updateFeeCollection: catchAsync(async (req, res) => {
        const { id } = req.params;
        const collection = await FeeCollection.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Fee collection not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fee collection updated successfully',
            data: collection
        });
    }),

    // Delete fee collection
    deleteFeeCollection: catchAsync(async (req, res) => {
        const { id } = req.params;
        const collection = await FeeCollection.findByIdAndDelete(id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Fee collection not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fee collection deleted successfully'
        });
    }),

    // Get fee structures
    getFeeStructures: catchAsync(async (req, res) => {
        const structures = await FeeStructure.find({ isActive: true })
            .populate('class', 'name')
            .populate('createdBy', 'name')
            .sort('class');

        return res.status(200).json({
            success: true,
            message: 'Fee structures retrieved successfully',
            data: structures
        });
    }),

    // Get collection report (placeholder)
    getCollectionReport: catchAsync(async (req, res) => {
        return res.status(200).json({
            success: true,
            message: 'Collection report retrieved successfully',
            data: []
        });
    }),

    // Get defaulters report (placeholder)
    getDefaultersReport: catchAsync(async (req, res) => {
        return res.status(200).json({
            success: true,
            message: 'Defaulters report retrieved successfully',
            data: []
        });
    }),

    // Get pending fees
    getPendingFees: catchAsync(async (req, res) => {
        const pendingFees = await Fee.find({ status: 'pending' })
            .populate('student', 'name class section')
            .sort('-dueDate');

        const formattedFees = pendingFees.map(fee => ({
            id: fee._id,
            studentName: fee.student?.name || 'N/A',
            className: fee.student?.class?.name || 'N/A',
            sectionName: fee.student?.section?.name || 'N/A',
            amountDue: fee.amount,
            dueDate: fee.dueDate,
            status: fee.status
        }));

        return res.status(200).json({
            success: true,
            message: 'Pending fees retrieved successfully',
            data: formattedFees
        });
    }),

    // Get late fees
    getLateFees: catchAsync(async (req, res) => {
        const penalties = await LateFee.find({ isActive: true })
            .sort('minDuration');

        return res.status(200).json({
            success: true,
            message: 'Late fee penalties retrieved successfully',
            data: penalties
        });
    }),

    // Get fee receipts
    getFeeReceipts: catchAsync(async (req, res) => {
        const receipts = await FeeCollection.find()
            .populate('student', 'name class')
            .populate('collectedBy', 'name')
            .sort('-createdAt');

        const formattedReceipts = receipts.map(receipt => ({
            _id: receipt._id,
            receiptNumber: receipt.receiptNumber,
            student: receipt.student,
            amount: receipt.amount,
            createdAt: receipt.createdAt,
            status: receipt.status,
            paymentMode: receipt.paymentMode
        }));

        return res.status(200).json({
            success: true,
            message: 'Fee receipts retrieved successfully',
            data: formattedReceipts
        });
    }),

    // Get fee receipt by ID
    getFeeReceiptById: catchAsync(async (req, res) => {
        const receipt = await FeeCollection.findById(req.params.id)
            .populate('student', 'name class')
            .populate('collectedBy', 'name');

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Receipt retrieved successfully',
            data: receipt
        });
    }),

    getReconciliations: catchAsync(async (req, res) => {
        const reconciliations = await FeeCollection.find({ 
            requiresReconciliation: true 
        })
        .populate('student', 'name class')
        .sort('-createdAt');

        const formattedReconciliations = reconciliations.map(item => ({
            id: item._id,
            transactionId: item.transactionId || 'N/A',
            amount: item.amount,
            date: item.createdAt,
            status: item.reconciliationStatus || 'pending',
            studentName: item.student?.name || 'N/A',
            paymentMode: item.paymentMode
        }));

        return res.status(200).json({
            success: true,
            message: 'Reconciliations retrieved successfully',
            data: formattedReconciliations
        });
    }),

    createReconciliation: catchAsync(async (req, res) => {
        const reconciliation = await FeeCollection.create({
            ...req.body,
            requiresReconciliation: true,
            reconciliationStatus: 'pending'
        });

        return res.status(201).json({
            success: true,
            message: 'Reconciliation created successfully',
            data: reconciliation
        });
    }),

    getFeeWaivers: catchAsync(async (req, res) => {
        const waivers = await FeeWaiver.find()
            .populate('student', 'name class')
            .sort('-createdAt');

        return res.status(200).json({
            success: true,
            message: 'Fee waivers retrieved successfully',
            data: waivers
        });
    }),

    createFeeWaiver: catchAsync(async (req, res) => {
        const waiver = await FeeWaiver.create({
            ...req.body,
            createdBy: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: 'Fee waiver created successfully',
            data: waiver
        });
    }),

    updateFeeWaiver: catchAsync(async (req, res) => {
        const waiver = await FeeWaiver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!waiver) {
            return res.status(404).json({
                success: false,
                message: 'Fee waiver not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fee waiver updated successfully',
            data: waiver
        });
    }),

    deleteFeeWaiver: catchAsync(async (req, res) => {
        const waiver = await FeeWaiver.findByIdAndDelete(req.params.id);

        if (!waiver) {
            return res.status(404).json({
                success: false,
                message: 'Fee waiver not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fee waiver deleted successfully'
        });
    }),

    getPaymentGateways: catchAsync(async (req, res) => {
        const settings = await PaymentGatewaySettings.findOne() || {};
        return res.status(200).json({
            success: true,
            message: 'Payment gateway settings retrieved successfully',
            data: settings
        });
    }),

    updatePaymentGateways: catchAsync(async (req, res) => {
        const settings = await PaymentGatewaySettings.findOneAndUpdate(
            {},
            req.body,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Payment gateway settings updated successfully',
            data: settings
        });
    }),

    createFeeStructure: catchAsync(async (req, res) => {
        try {
            const { class: classId, baseFee, feeComponents } = req.body;

            // Validate required fields
            if (!classId || !baseFee) {
                return res.status(400).json({
                    success: false,
                    message: 'Class and base fee are required'
                });
            }

            // Create fee structure
            const feeStructure = await FeeStructure.create({
                class: classId,
                baseFee: Number(baseFee),
                feeComponents: feeComponents.map(comp => ({
                    name: comp.name,
                    amount: Number(comp.amount)
                })),
                createdBy: req.user?._id
            });

            return res.status(201).json({
                success: true,
                message: 'Fee structure created successfully',
                data: feeStructure
            });
        } catch (error) {
            console.error('Fee structure creation error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Error creating fee structure'
            });
        }
    }),

    updateFeeStructure: catchAsync(async (req, res) => {
        try {
            const { id } = req.params;
            const { class: classId, baseFee, feeComponents } = req.body;

            if (!classId || !baseFee) {
                return res.status(400).json({
                    success: false,
                    message: 'Class and base fee are required'
                });
            }

            const structure = await FeeStructure.findByIdAndUpdate(
                id,
                {
                    class: classId,
                    baseFee: Number(baseFee),
                    feeComponents: feeComponents.map(comp => ({
                        name: comp.name,
                        amount: Number(comp.amount)
                    })),
                    lastUpdatedBy: req.user?._id
                },
                { new: true, runValidators: true }
            );

            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message: 'Fee structure not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Fee structure updated successfully',
                data: structure
            });
        } catch (error) {
            console.error('Fee structure update error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Error updating fee structure'
            });
        }
    }),

    deleteFeeStructure: catchAsync(async (req, res) => {
        const structure = await FeeStructure.findByIdAndDelete(req.params.id);

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Fee structure deleted successfully'
        });
    }),

    getFeeAdjustments: catchAsync(async (req, res) => {
        const adjustments = await FeeAdjustment.find()
            .sort('-createdAt');

        const defaultAdjustments = {
            general: { type: 'percentage', value: 0 },
            obc: { type: 'percentage', value: 0 },
            sc: { type: 'percentage', value: 0 },
            st: { type: 'percentage', value: 0 }
        };

        return res.status(200).json({
            success: true,
            message: 'Fee adjustments retrieved successfully',
            data: adjustments.length > 0 ? adjustments[0] : defaultAdjustments
        });
    }),

    updateFeeAdjustments: catchAsync(async (req, res) => {
        // Check if user exists in request
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - User not authenticated'
            });
        }

        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Bad request - Fee adjustments data is required'
            });
        }

        const adjustment = await FeeAdjustment.findOneAndUpdate(
            {},
            {
                ...req.body,
                lastUpdatedBy: req.user._id
            },
            { 
                new: true, 
                upsert: true,
                runValidators: true 
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Fee adjustments updated successfully',
            data: adjustment
        });
    }),

    getTransportFees: catchAsync(async (req, res) => {
        const fees = await TransportFee.find().sort('distance');
        return res.status(200).json({
            success: true,
            message: 'Transport fees retrieved successfully',
            data: fees
        });
    }),

    createTransportFee: catchAsync(async (req, res) => {
        try {
            const { minDistance, maxDistance, cost } = req.body;

            // Validate inputs
            if (!minDistance || !maxDistance || !cost) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // Validate numbers
            const min = Number(minDistance);
            const max = Number(maxDistance);
            const amount = Number(cost);

            if (isNaN(min) || isNaN(max) || isNaN(amount)) {
                return res.status(400).json({
                    success: false,
                    message: 'All values must be valid numbers'
                });
            }

            if (min < 0 || max < 0 || amount < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Values cannot be negative'
                });
            }

            if (max <= min) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum distance must be greater than minimum distance'
                });
            }

            const transportFee = await TransportFee.create({
                minDistance: min,
                maxDistance: max,
                cost: amount,
                createdBy: req.user?._id
            });

            return res.status(201).json({
                success: true,
                message: 'Transport fee created successfully',
                data: transportFee
            });
        } catch (error) {
            console.error('Transport fee creation error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Error creating transport fee'
            });
        }
    }),

    createLateFee: catchAsync(async (req, res) => {
        try {
            const { minDuration, maxDuration, penalty } = req.body;

            // Validate inputs
            if (!minDuration || !maxDuration || !penalty) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields (minDuration, maxDuration, penalty) are required'
                });
            }

            // Convert to numbers and validate
            const min = Number(minDuration);
            const max = Number(maxDuration);
            const amount = Number(penalty);

            if (isNaN(min) || isNaN(max) || isNaN(amount)) {
                return res.status(400).json({
                    success: false,
                    message: 'All values must be valid numbers'
                });
            }

            if (min < 0 || max < 0 || amount < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Values cannot be negative'
                });
            }

            if (max <= min) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum duration must be greater than minimum duration'
                });
            }

            const lateFee = await LateFee.create({
                minDuration: min,
                maxDuration: max,
                penalty: amount,
                createdBy: req.user?._id
            });

            return res.status(201).json({
                success: true,
                message: 'Late fee penalty created successfully',
                data: lateFee
            });
        } catch (error) {
            console.error('Late fee creation error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Error creating late fee penalty'
            });
        }
    }),

    updateLateFee: catchAsync(async (req, res) => {
        const lateFee = await LateFee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!lateFee) {
            return res.status(404).json({
                success: false,
                message: 'Late fee penalty not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Late fee penalty updated successfully',
            data: lateFee
        });
    }),

    deleteLateFee: catchAsync(async (req, res) => {
        const lateFee = await LateFee.findByIdAndDelete(req.params.id);

        if (!lateFee) {
            return res.status(404).json({
                success: false,
                message: 'Late fee penalty not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Late fee penalty deleted successfully'
        });
    })
};

module.exports = feesController;
