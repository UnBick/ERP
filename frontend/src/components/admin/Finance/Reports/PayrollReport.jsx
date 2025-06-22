import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import MonthlyReport from '../../Reports/Payroll/MonthlyReport';
import YearlyReport from '../../Reports/Payroll/YearlyReport';
import IndividualReport from '../../Reports/Payroll/IndividualReport';
import { payrollService } from '../../../../services/payrollService';
import { getApiUrl } from '../../../../config/apiConfig';

const PayrollReport = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [alert, setAlert] = useState(null);

  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/admin/staff'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStaffList(data.data);
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaffList();
  }, []);

  const handleGenerateReport = async (month, year, type) => {
    setLoading(true);
    try {
      const result = await payrollService.generateReport(type, month, year);
      if (result.success) {
        setReportData(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to generate report'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIndividual = async (staffId) => {
    setLoading(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/admin/finance/payroll/reports/staff/${staffId}`),
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (month, year, type) => {
    try {
      const blob = await payrollService.downloadReport(type, month, year);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${type}_${month || ''}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Failed to download report'
      });
    }
  };

  const handleDownloadIndividual = async (staffId, month, year) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/admin/finance/payroll/reports/download/individual/${staffId}?month=${month}&year=${year}`),
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip_${staffId}_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Monthly Report" />
        <Tab label="Yearly Report" />
        <Tab label="Individual Report" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <MonthlyReport
            months={months}
            years={years}
            onGenerate={handleGenerateReport}
            onDownload={handleDownload}
            data={reportData}
            loading={loading}
          />
        )}
        {activeTab === 1 && (
          <YearlyReport
            years={years}
            onGenerate={handleGenerateReport}
            onDownload={handleDownload}
            data={reportData}
            loading={loading}
          />
        )}
        {activeTab === 2 && <IndividualReport />}
      </Box>

      {alert && (
        <Snackbar open autoHideDuration={6000} onClose={() => setAlert(null)}>
          <Alert onClose={() => setAlert(null)} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default PayrollReport;
