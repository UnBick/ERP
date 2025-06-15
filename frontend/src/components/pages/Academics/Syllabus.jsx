import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import './styles/Syllabus.css';

const Syllabus = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClassChange = async (classLevel) => {
    setLoading(true);
    setSelectedClass(classLevel);
    setSelectedSubject('');
    try {
      const data = await ApiService.getSyllabus(classLevel);
      setSyllabus(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="syllabus-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Academic Syllabus</h1>

      <div className="class-selector">
        <div className="class-groups">
          {[
            { label: "Primary", classes: [1, 2, 3, 4, 5] },
            { label: "Middle", classes: [6, 7, 8] },
            { label: "Secondary", classes: [9, 10] },
            { label: "Senior Secondary", classes: [11, 12] }
          ].map(group => (
            <div key={group.label} className="class-group">
              <h3>{group.label}</h3>
              <div className="class-buttons">
                {group.classes.map(classNum => (
                  <motion.button
                    key={classNum}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={selectedClass === classNum ? 'active' : ''}
                    onClick={() => handleClassChange(classNum)}
                  >
                    Class {classNum}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div className="loading">Loading...</motion.div>
        ) : syllabus && (
          <motion.div 
            className="syllabus-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Syllabus content */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Syllabus;
