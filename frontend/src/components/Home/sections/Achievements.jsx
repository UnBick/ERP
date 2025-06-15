import React from 'react';
import '../styles/Achievements.css';

const Achievements = () => {
  const achievements = [
    { id: 1, number: "1000+", title: "Students", description: "Enrolled annually" },
    { id: 2, number: "100+", title: "Faculty", description: "Dedicated teachers" },
    { id: 3, number: "95%", title: "Success Rate", description: "Academic excellence" },
    { id: 4, number: "50+", title: "Programs", description: "Diverse courses" }
  ];

  return (
    <div className="achievements-section">
      <div className="achievements-container">
        <h2 className="section-title">Our Achievements</h2>
        <div className="achievements-grid">
          {achievements.map(({ id, number, title, description }) => (
            <div key={id} className="achievement-card" data-aos="fade-up">
              <div className="achievement-number">{number}</div>
              <h3 className="achievement-title">{title}</h3>
              <p className="achievement-description">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
