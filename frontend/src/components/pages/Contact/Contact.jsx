import React, { useState } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.submitContactForm(formData);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <p>123 School Address, City, State - PIN</p>
          </div>
          <div className="info-item">
            <i className="fas fa-phone"></i>
            <p>+91 1234567890</p>
          </div>
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <p>contact@school.com</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      </div>

      <div className="map-container">
        {/* Google Maps integration */}
      </div>
    </div>
  );
};

export default Contact;
