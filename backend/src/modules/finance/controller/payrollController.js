const catchAsync = require('../../../utils/catchAsync');
const Payroll = require('../models/Payroll');
const Staff = require('../../staff/models/Staff');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { generatePayrollPDF } = require('../../../utils/pdfGenerator');
const { generatePayrollExcel } = require('../../../utils/excelGenerator');

// Only export implemented functions
module.exports = {
    getAllSalaries: catchAsync(async (req, res) => {
        const salaries = await Payroll.find({ isActive: true })
            .populate('staffId', 'name department staffID')
            .sort('-year -month');

        res.json({
            success: true,
            data: salaries
        });
    }),

    createSalary: catchAsync(async (req, res) => {
        const { staffId, basicPay, month, year } = req.body;
        
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        const allowances = {
            hra: Math.floor(basicPay * 0.4),
            da: Math.floor(basicPay * 0.1),
            travelAllowance: 3000,
            medicalAllowance: 2000
        };

        const deductions = {
            pf: Math.floor(basicPay * 0.12),
            tds: Math.floor(basicPay * 0.1),
            professionalTax: 200
        };

        const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
        const netPay = Number(basicPay) + totalAllowances - totalDeductions;

        const salary = await Payroll.create({
            staffId,
            staffName: staff.name,
            basicPay: Number(basicPay),
            month: Number(month),
            year: Number(year),
            allowances,
            deductions,
            totalAllowances,
            totalDeductions,
            netPay,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: salary
        });
    }),

    updateSalary: catchAsync(async (req, res) => {
        const salary = await Payroll.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary not found'
            });
        }

        res.json({
            success: true,
            data: salary
        });
    }),

    deleteSalary: catchAsync(async (req, res) => {
        const salary = await Payroll.findByIdAndDelete(req.params.id);

        if (!salary) {
            return res.status(404).json({
                success: false,
                message: 'Salary not found'
            });
        }

        res.json({
            success: true,
            message: 'Salary deleted successfully'
        });
    }),

    getPayrollReports: catchAsync(async (req, res) => {
        const { type, month, year } = req.query;
        console.log('Received payroll request:', { type, month, year });

        try {
            if (type === 'yearly') {
                // Yearly aggregation
                const yearlyReports = await Payroll.aggregate([
                    {
                        $match: {
                            year: parseInt(year),
                            isActive: true
                        }
                    },
                    {
                        $group: {
                            _id: '$staffId',
                            staffName: { $first: '$staffName' },
                            department: { $first: '$department' },
                            totalBasicPay: { $sum: '$basicPay' },
                            totalAllowances: { $sum: '$totalAllowances' },
                            totalDeductions: { $sum: '$totalDeductions' },
                            totalYearlyPay: { $sum: '$netPay' }
                        }
                    }
                ]);

                return res.json({
                    success: true,
                    data: yearlyReports
                });
            }

            // Monthly report logic
            if (type === 'monthly') {
                if (!month || !year) {
                    return res.status(400).json({
                        success: false,
                        message: 'Month and year are required for monthly reports'
                    });
                }

                const monthlyReports = await Payroll.find({
                    month: parseInt(month),
                    year: parseInt(year),
                    isActive: true
                }).populate('staffId', 'name department');

                return res.json({
                    success: true,
                    data: monthlyReports
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });

        } catch (error) {
            console.error('Error in getPayrollReports:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }),

    getStaffPayrollReport: catchAsync(async (req, res) => {
        const { staffId } = req.params;
        const { year } = req.query;

        try {
            // Get staff details
            const staff = await Staff.findById(staffId);
            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found'
                });
            }

            // Get all salary records for the year
            const salaryRecords = await Payroll.find({
                staffId,
                year: parseInt(year),
                isActive: true
            }).sort({ month: 1 });

            // Calculate yearly totals
            const yearlyTotals = salaryRecords.reduce((acc, record) => ({
                totalBasicPay: (acc.totalBasicPay || 0) + record.basicPay,
                totalAllowances: (acc.totalAllowances || 0) + record.totalAllowances,
                totalDeductions: (acc.totalDeductions || 0) + record.totalDeductions,
                totalNetPay: (acc.totalNetPay || 0) + record.netPay
            }), {});

            res.json({
                success: true,
                data: {
                    staffDetails: {
                        name: staff.name,
                        department: staff.department,
                        designation: staff.designation,
                        joinDate: staff.joiningDate,
                        employeeId: staff.staffID
                    },
                    yearlyTotals,
                    monthlyRecords: salaryRecords
                }
            });

        } catch (error) {
            console.error('Error in getStaffPayrollReport:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }),

    downloadReport: catchAsync(async (req, res) => {
        const { type, month, year, format = 'pdf' } = req.query;
        
        try {
            let data;
            if (type === 'monthly') {
                data = await Payroll.find({
                    month: parseInt(month),
                    year: parseInt(year),
                    isActive: true
                }).populate('staffId', 'name department');
            } else if (type === 'yearly') {
                data = await Payroll.aggregate([
                    {
                        $match: {
                            year: parseInt(year),
                            isActive: true
                        }
                    },
                    {
                        $group: {
                            _id: '$staffId',
                            staffName: { $first: '$staffName' },
                            department: { $first: '$department' },
                            totalBasicPay: { $sum: '$basicPay' },
                            totalAllowances: { $sum: '$totalAllowances' },
                            totalDeductions: { $sum: '$totalDeductions' },
                            totalYearlyPay: { $sum: '$netPay' }
                        }
                    }
                ]);
            }

            if (format === 'excel') {
                const workbook = await generatePayrollExcel(data, type);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=payroll_${type}_${month || ''}_${year}.xlsx`);
                await workbook.xlsx.write(res);
                return;
            }

            const doc = await generatePayrollPDF(data, type);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payroll_${type}_${month || ''}_${year}.pdf`);
            doc.pipe(res);
            doc.end();

        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate report'
            });
        }
    }),

    downloadIndividualReport: catchAsync(async (req, res) => {
        const { staffId } = req.params;
        const { year, month } = req.query;

        try {
            console.log('Generating individual report for:', { staffId, year, month });

            const staff = await Staff.findById(staffId);
            if (!staff) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Staff not found' 
                });
            }

            // Build query
            const query = {
                staffId,
                year: parseInt(year),
                isActive: true
            };

            if (month) {
                query.month = parseInt(month);
            }

            console.log('Query:', query);

            // Get salary records
            const records = await Payroll.find(query)
                .sort({ month: 1 })
                .lean();

            console.log(`Found ${records.length} records`);

            if (records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No salary records found for the specified period'
                });
            }

            // Generate PDF
            const doc = new PDFDocument();

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=payslip_${staff.staffID || staffId}_${year}_${month || 'full'}.pdf`);

            // Pipe the PDF document to the response
            doc.pipe(res);

            // Add content to PDF
            doc.fontSize(16)
                .text(`Salary Report - ${staff.name}`, { align: 'center' })
                .moveDown();

            doc.fontSize(12)
                .text(`Staff ID: ${staff.staffID}`)
                .text(`Department: ${staff.department}`)
                .text(`Period: ${month ? `Month ${month}` : 'Full Year'} ${year}`)
                .moveDown();

            // Add salary details
            records.forEach(record => {
                doc.text(`Month: ${record.month}`)
                    .text(`Basic Pay: ₹${record.basicPay}`)
                    .text(`Total Allowances: ₹${record.totalAllowances}`)
                    .text(`Total Deductions: ₹${record.totalDeductions}`)
                    .text(`Net Pay: ₹${record.netPay}`)
                    .moveDown();
            });

            // Finalize the PDF
            doc.end();

        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate payslip',
                error: error.message
            });
        }
    }),

    downloadBulkReport: catchAsync(async (req, res) => {
        const { year, month, staffIds } = req.body;
        
        try {
            if (!year || !Array.isArray(staffIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request parameters'
                });
            }

            const query = {
                staffId: { $in: staffIds },
                year: parseInt(year),
                isActive: true
            };

            if (month) {
                query.month = parseInt(month);
            }

            const records = await Payroll.find(query)
                .populate('staffId', 'name department')
                .sort({ staffId: 1, month: 1 });

            if (records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No records found'
                });
            }

            // Generate bulk report
            const doc = await generatePayrollPDF(records, 'bulk');
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=bulk_payroll_${year}_${month || 'all'}.pdf`);
            doc.pipe(res);
            doc.end();

        } catch (error) {
            console.error('Bulk download error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate bulk report'
            });
        }
    })
};