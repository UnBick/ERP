import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './styles/Footer.css';

const Footer = () => {
  const [contactData, setContactData] = useState(null);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await fetch('/api/admin/contact-info');
      const data = await response.json();
      setContactData(data);
    } catch (error) {
      console.error('Failed to load contact information');
    }
  };

  if (!contactData) {
    return (
      <footer className="main-footer">
        <div className="footer-loading">
          <p>Loading footer...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>{contactData.address || 'No address available'}</p>
          {contactData.phones?.map((phone, idx) => (
            <p key={idx}>
              <i className="fas fa-phone"></i> {phone.number} ({phone.type})
            </p>
          ))}
          {contactData.emails?.map((email, idx) => (
            <p key={idx}>
              <i className="fas fa-envelope"></i> {email.address}
            </p>
          ))}
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          {contactData.footerContent?.quickLinks?.map((link, idx) => (
            <Link key={idx} to={link.path}>{link.title}</Link>
          ))}
        </div>

        <div className="footer-section">
          <h3>Location</h3>
          {contactData.location ? (
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '200px' }}
                center={contactData.location}
                zoom={15}
              >
                <Marker position={contactData.location} />
              </GoogleMap>
            </LoadScript>
          ) : (
            <p>No location available</p>
          )}
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            {contactData.footerContent?.socialMedia &&
              Object.entries(contactData.footerContent.socialMedia).map(([platform, data]) => (
                <a
                  key={platform}
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                >
                  <i className={data.icon}></i>
                </a>
              ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{contactData.footerContent?.copyright || '© 2025 Company Name'}</p>
      </div>
    </footer>
  );
};

export default Footer;
