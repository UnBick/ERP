import React from 'react';
import './styles/Process.css';

const AdmissionProcess = () => {
  const steps = [
    {
      title: 'Registration',
      icon: 'form',
      description: 'Fill out the online registration form and pay registration fee'
    },
    {
      title: 'Document Submission',
      icon: 'file',
      description: 'Submit required documents including previous academic records'
    },
    {
      title: 'Entrance Test',
      icon: 'edit',
      description: 'Appear for entrance assessment (for classes VI and above)'
    },
    {
      title: 'Interview',
      icon: 'users',
      description: 'Parent-student interview with school administration'
    }
  ];

  return (
    <div className="admission-process">
      <h1>Admission Process</h1>
      <div className="process-timeline">
        {steps.map((step, index) => (
          <div key={index} className="process-step" data-aos="fade-up">
            <div className="step-icon">
              <i className={`fas fa-${step.icon}`}></i>
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionProcess;
