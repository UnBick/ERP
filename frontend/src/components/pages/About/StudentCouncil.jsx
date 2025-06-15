import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApiService from '../../../utils/ApiService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './styles/StudentCouncil.css';

const StudentCouncil = () => {
  const [council, setCouncil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchCouncilMembers = async () => {
      try {
        const data = await ApiService.getStudentCouncil();
        setCouncil(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching council members:', error);
        setLoading(false);
      }
    };
    fetchCouncilMembers();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div 
      className="student-council"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <h1>Student Council {new Date().getFullYear()}</h1>

      <motion.div className="head-students" variants={container}>
        {['headBoy', 'headGirl'].map(role => (
          <motion.div
            key={role}
            className="member-card"
            variants={item}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedMember(council[role])}
          >
            <div className="member-image">
              <img src={council[role].photo} alt={council[role].name} />
              <div className="member-overlay">
                <span>View Profile</span>
              </div>
            </div>
            <h3>{role === 'headBoy' ? 'Head Boy' : 'Head Girl'}</h3>
            <h4>{council[role].name}</h4>
            <p>Class {council[role].class}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="house-leaders" variants={container}>
        <h2>House Leaders</h2>
        <div className="leaders-grid">
          {council?.houseLeaders.map((leader, index) => (
            <motion.div
              key={leader._id}
              className="leader-card"
              variants={item}
              whileHover={{ scale: 1.05 }}
              style={{ backgroundColor: leader.houseColor }}
            >
              <div className="house-icon">
                <i className={`fas fa-${leader.houseIcon}`}></i>
              </div>
              <h4>{leader.house} House</h4>
              <p>{leader.name}</p>
              <span className="view-details">View Details</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {selectedMember && (
        <motion.div 
          className="member-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal content */}
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudentCouncil;
