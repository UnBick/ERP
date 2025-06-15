import React from 'react';
import { motion } from 'framer-motion';
import './styles/PhilosophyMission.css';

const PhilosophyMission = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="philosophy-mission"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="vision-section" variants={item}>
        <div className="section-icon">
          <i className="fas fa-eye"></i>
        </div>
        <h2>Our Vision</h2>
        <p>To nurture global citizens with strong values and innovative mindset</p>
      </motion.div>
      
      <motion.div className="mission-section" variants={item}>
        <div className="section-icon">
          <i className="fas fa-bullseye"></i>
        </div>
        <h2>Our Mission</h2>
        <motion.ul variants={container}>
          {[
            'Provide quality education through innovative teaching methods',
            'Foster critical thinking and creativity',
            'Develop leadership qualities and social responsibility',
            'Promote cultural values and global awareness'
          ].map((mission, index) => (
            <motion.li key={index} variants={item}>
              {mission}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div className="core-values" variants={item}>
        <h2>Core Values</h2>
        <div className="values-grid">
          {[
            { name: 'Excellence', icon: 'star' },
            { name: 'Integrity', icon: 'shield' },
            { name: 'Innovation', icon: 'lightbulb' },
            { name: 'Respect', icon: 'hands' },
            { name: 'Responsibility', icon: 'check-circle' }
          ].map((value, index) => (
            <motion.div 
              key={value.name} 
              className="value-card"
              whileHover={{ scale: 1.1 }}
              variants={item}
            >
              <i className={`fas fa-${value.icon}`}></i>
              <h3>{value.name}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhilosophyMission;
