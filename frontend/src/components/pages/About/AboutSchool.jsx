import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timeline } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import './styles/AboutSchool.css';

const AboutSchool = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const milestones = [
    { year: '1995', title: 'Foundation', description: 'School was established' },
    { year: '2005', title: 'Expansion', description: 'New campus inauguration' },
    { year: '2015', title: 'Excellence', description: 'Ranked top in region' },
    { year: '2023', title: 'Innovation', description: 'Digital transformation' }
  ];

  return (
    <motion.div 
      className="about-school-page"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="hero-section">
        <h1>About Our School</h1>
        <div className="stats-container">
          {[
            { count: '25+', label: 'Years of Excellence' },
            { count: '1000+', label: 'Students' },
            { count: '100+', label: 'Faculty' },
            { count: '95%', label: 'Success Rate' }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="stat-box"
              whileHover={{ scale: 1.05 }}
            >
              <h2>{stat.count}</h2>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Timeline>
        {milestones.map((milestone, index) => (
          <Timeline.Item key={index}>
            <h3>{milestone.year}</h3>
            <h4>{milestone.title}</h4>
            <p>{milestone.description}</p>
          </Timeline.Item>
        ))}
      </Timeline>

      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h2>Our Legacy</h2>
        <p>Brief history and achievements of the school...</p>
      </motion.section>
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h2>Our Vision</h2>
        <p>Educational philosophy and future goals...</p>
      </motion.section>
      <motion.section
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <h2>Core Values</h2>
        <ul>
          <li>Academic Excellence</li>
          <li>Character Development</li>
          <li>Innovation in Learning</li>
          <li>Community Service</li>
        </ul>
      </motion.section>
    </motion.div>
  );
};

export default AboutSchool;
