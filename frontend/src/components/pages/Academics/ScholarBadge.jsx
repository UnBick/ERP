import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/ScholarBadge.css';

const ScholarBadge = () => {
  const [scholars, setScholars] = useState({
    current: [],
    previous: []
  });
  const [activeYear, setActiveYear] = useState('current');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const fetchScholars = async () => {
      try {
        const data = await ApiService.getScholarBadgeHolders();
        setScholars(data);
      } catch (error) {
        console.error('Error fetching scholars:', error);
      }
    };
    fetchScholars();
  }, []);

  const filteredScholars = scholars[activeYear].filter(scholar =>
    selectedClass === 'all' || scholar.class === selectedClass
  );

  return (
    <motion.div 
      className="scholar-badge"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Scholar Badge Holders</h1>
      
      <div className="filter-controls">
        <div className="year-toggle">
          <button 
            className={activeYear === 'current' ? 'active' : ''}
            onClick={() => setActiveYear('current')}
          >
            Current Year
          </button>
          <button 
            className={activeYear === 'previous' ? 'active' : ''}
            onClick={() => setActiveYear('previous')}
          >
            Previous Year
          </button>
        </div>

        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">All Classes</option>
          {[9, 10, 11, 12].map(num => (
            <option key={num} value={num}>Class {num}</option>
          ))}
        </select>
      </div>

      <motion.div 
        className="scholars-grid"
        layout
      >
        {filteredScholars.map(scholar => (
          <motion.div
            key={scholar._id}
            className="scholar-card"
            whileHover={{ scale: 1.05 }}
            layout
          >
            <h3>{scholar.name}</h3>
            <p>Class: {scholar.class}</p>
            <p>Percentage: {scholar.percentage}%</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ScholarBadge;
