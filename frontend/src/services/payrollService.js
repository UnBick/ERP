import { getApiUrl } from '../config/apiConfig';
const API_BASE_URL = getApiUrl('api/v1/admin/finance/payroll');

const getMonthNumber = (monthName) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.indexOf(monthName) + 1;
};

export const payrollService = {
    async fetchSalaries(month, year) {
        const response = await fetch(
            `${API_BASE_URL}/salaries?month=${month}&year=${year}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.json();
    },

    async generateReport(type, month, year) {
        const monthNumber = typeof month === 'string' ? getMonthNumber(month) : month;
        const response = await fetch(
            `${API_BASE_URL}/reports?type=${type}&month=${monthNumber}&year=${year}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.json();
    },

    async downloadReport(type, month, year) {
        const response = await fetch(
            `${API_BASE_URL}/reports/download/${type}?month=${month}&year=${year}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        return response.blob();
    },

    async getStaffReport(staffId, year) {
        if (!staffId || !year) {
            throw new Error('Staff ID and year are required');
        }

        const response = await fetch(
            `${API_BASE_URL}/reports/staff/${staffId}?year=${year}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch staff report');
        }

        return response.json();
    },

    async downloadIndividualReport(staffId, year, month = null) {
        try {
            const requestUrl = new URL(`${API_BASE_URL}/reports/download/individual/${staffId}`);
            requestUrl.searchParams.append('year', year);
            if (month) requestUrl.searchParams.append('month', month);

            const response = await fetch(requestUrl.toString(), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `payslip_${staffId}_${year}_${month || 'full'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error('Failed to download report');
        }
    }
};
