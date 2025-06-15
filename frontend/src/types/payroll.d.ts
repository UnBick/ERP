export interface PayrollReport {
    _id: string;
    staffName: string;
    basicPay: number;
    allowances: {
        hra: number;
        da: number;
        travelAllowance: number;
        medicalAllowance: number;
    };
    deductions: {
        pf: number;
        tds: number;
        professionalTax: number;
    };
    totalAllowances: number;
    totalDeductions: number;
    netPay: number;
    status: string;
    month: number;
    year: number;
}

export interface ReportGenerationOptions {
    type: 'monthly' | 'yearly' | 'individual';
    month?: number;
    year: number;
    staffId?: string;
}
