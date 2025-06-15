const ExcelJS = require('exceljs');

const generatePayrollExcel = async (data, type) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');

    if (type === 'monthly') {
        await generateMonthlyExcel(worksheet, data);
    } else if (type === 'yearly') {
        await generateYearlyExcel(worksheet, data);
    }

    return workbook;
};

const generateMonthlyExcel = async (worksheet, data) => {
    // Set headers
    worksheet.columns = [
        { header: 'Staff Name', key: 'staffName', width: 20 },
        { header: 'Basic Pay', key: 'basicPay', width: 15 },
        { header: 'HRA', key: 'hra', width: 15 },
        { header: 'DA', key: 'da', width: 15 },
        { header: 'Travel Allowance', key: 'travel', width: 15 },
        { header: 'Medical Allowance', key: 'medical', width: 15 },
        { header: 'PF', key: 'pf', width: 15 },
        { header: 'TDS', key: 'tds', width: 15 },
        { header: 'Prof. Tax', key: 'profTax', width: 15 },
        { header: 'Net Pay', key: 'netPay', width: 15 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    data.forEach(record => {
        worksheet.addRow({
            staffName: record.staffName,
            basicPay: record.basicPay,
            hra: record.allowances.hra,
            da: record.allowances.da,
            travel: record.allowances.travelAllowance,
            medical: record.allowances.medicalAllowance,
            pf: record.deductions.pf,
            tds: record.deductions.tds,
            profTax: record.deductions.professionalTax,
            netPay: record.netPay
        });
    });

    // Format number columns
    ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
        worksheet.getColumn(col).numFmt = '₹#,##0.00';
        worksheet.getColumn(col).alignment = { horizontal: 'right' };
    });
};

// ... rest of implementation ...

module.exports = {
    generatePayrollExcel
};
