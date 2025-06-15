import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/Fees.css';

const FeeStructure = () => {
  const [feeStructure, setFeeStructure] = useState({});
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const data = await ApiService.getFeeStructure();
        setFeeStructure(data);
      } catch (error) {
        console.error('Error fetching fee structure:', error);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="fee-structure">
      <h1>Fee Structure</h1>
      <div className="fee-filters">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="all">All Classes</option>
          {/* Add class options */}
        </select>
      </div>
      <div className="fee-table">
        {/* Fee structure table */}
      </div>
    </div>
  );
};

export default FeeStructure;
