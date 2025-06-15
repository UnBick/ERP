import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import './styles/Awards.css';

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAwards();
      setAwards(data);
    } catch (error) {
      setError('Failed to load awards. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} retry={fetchAwards} />;

  return (
    <motion.div 
      className="awards-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="page-title">School Achievements & Awards</h1>
      <div className="awards-grid">
        {awards.map((award, index) => (
          <motion.div
            key={award._id}
            className="award-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="award-icon">
              <i className={`fas fa-${award.icon || 'trophy'}`}></i>
            </div>
            <h3>{award.title}</h3>
            <p className="award-year">{award.year}</p>
            <p className="award-description">{award.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Awards;
