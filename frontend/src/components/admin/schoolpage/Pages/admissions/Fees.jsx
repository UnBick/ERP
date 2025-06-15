import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import { toast } from 'react-toastify';
import './styles/Fees.css';

const Fees = () => {
  const [feeStructure, setFeeStructure] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchFeeStructureFromAdmin();
  }, []);

  // Fetch fee data from admin's FeeStructure component
  const fetchFeeStructureFromAdmin = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/feeStructures');
      const data = await response.json();
      
      // Transform the data into grade-wise structure
      const structuredData = data.reduce((acc, fee) => ({
        ...acc,
        [fee.classId]: {
          amount: fee.amount,
          description: fee.description,
          installments: fee.installments,
          additionalFees: fee.additionalFees,
          lastUpdated: fee.updatedAt
        }
      }), {});

      setFeeStructure(structuredData);
    } catch (error) {
      toast.error('Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  const renderFeeDetails = (feeData) => {
    if (!feeData) return null;

    return (
      <div className="fee-details">
        <h3>Fee Structure Details</h3>
        <div className="fee-breakdown">
          <div className="fee-item">
            <span>Tuition Fee:</span>
            <span>₹{feeData.amount}</span>
          </div>
          {feeData.additionalFees?.map((fee, index) => (
            <div key={index} className="fee-item">
              <span>{fee.name}:</span>
              <span>₹{fee.amount}</span>
            </div>
          ))}
          <div className="fee-total">
            <strong>Total:</strong>
            <strong>
              ₹{calculateTotal(feeData)}
            </strong>
          </div>
        </div>

        {feeData.installments && (
          <div className="installment-options">
            <h4>Installment Options</h4>
            <ul>
              {feeData.installments.map((inst, index) => (
                <li key={index}>
                  {inst.name}: ₹{inst.amount} (Due: {inst.dueDate})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const calculateTotal = (feeData) => {
    const baseAmount = Number(feeData.amount) || 0;
    const additionalTotal = feeData.additionalFees?.reduce(
      (sum, fee) => sum + Number(fee.amount), 0
    ) || 0;
    return baseAmount + additionalTotal;
  };

  return (
    <AdminContentLayout pageType="fee-structure">
      <div className="fee-display">
        <div className="controls">
          <button 
            onClick={handlePreviewToggle}
            className={`preview-toggle ${previewMode ? 'active' : ''}`}
          >
            {previewMode ? 'Edit View' : 'Student View'}
          </button>
        </div>

        <div className="grade-selector">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`grade-btn ${selectedGrade === grade ? 'active' : ''}`}
            >
              Grade {grade}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading fee structure...</div>
        ) : selectedGrade ? (
          <div className={`fee-content ${previewMode ? 'preview-mode' : ''}`}>
            {renderFeeDetails(feeStructure[selectedGrade])}
            {!previewMode && (
              <div className="last-updated">
                Last Updated: {new Date(feeStructure[selectedGrade]?.lastUpdated).toLocaleDateString()}
              </div>
            )}
          </div>
        ) : (
          <div className="select-prompt">
            Please select a grade to view fee structure
          </div>
        )}
      </div>
    </AdminContentLayout>
  );
};

export default Fees;
