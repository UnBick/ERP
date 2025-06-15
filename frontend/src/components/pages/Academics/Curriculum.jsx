import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/Curriculum.css';

const Curriculum = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sections = {
    primary: {
      title: "Primary Section (Classes I-V)",
      subjects: ["Languages", "Mathematics", "Environmental Studies", "General Knowledge"],
      features: ["Interactive Learning", "Activity Based", "Continuous Assessment"]
    },
    // ...add more sections
  };

  return (
    <motion.div 
      className="curriculum-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Academic Curriculum</h1>
      
      <div className="curriculum-sections">
        {Object.entries(sections).map(([key, section]) => (
          <motion.section
            key={key}
            className={`section-card ${activeSection === key ? 'active' : ''}`}
            onClick={() => setActiveSection(activeSection === key ? null : key)}
            whileHover={{ scale: 1.02 }}
          >
            <h2>{section.title}</h2>
            <AnimatePresence>
              {activeSection === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {/* Section content */}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        ))}
      </div>
    </motion.div>
  );
};

export default Curriculum;
