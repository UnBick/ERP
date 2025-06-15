import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../styles/Footer.css';

const Footer = () => {
  const defaultData = {
    address: "123 School Street, Education City, Delhi, 110001",
    phones: [
      { number: "+91 11-2234-5678", type: "Main Office" },
      { number: "+91 11-2234-5679", type: "Admissions" },
      { number: "+91 11-2234-5680", type: "Transport" }
    ],
    emails: [
      { address: "info@delhipublicschool.edu", type: "General" },
      { address: "admissions@delhipublicschool.edu", type: "Admissions" },
      { address: "principal@delhipublicschool.edu", type: "Principal's Office" }
    ],
    location: { lat: 28.6139, lng: 77.2090 },
    footerContent: {
      quickLinks: [
        { title: "About Us", path: "/about" },
        { title: "Academics", path: "/academics" },
        { title: "Admissions", path: "/admissions" },
        { title: "Faculty", path: "/faculty" }
      ],
      facilities: [
        { title: "Smart Classrooms", path: "/facilities/smart-classrooms" },
        { title: "Science Labs", path: "/facilities/labs" },
        { title: "Library", path: "/facilities/library" }
      ],
      socialMedia: {
        facebook: { url: "https://facebook.com/delhipublicschool", icon: "fab fa-facebook" },
        twitter: { url: "https://twitter.com/delhipubschool", icon: "fab fa-twitter" },
        instagram: { url: "https://instagram.com/delhipublicschool", icon: "fab fa-instagram" }
      },
      extraLinks: [
        { title: "Student Portal", path: "/student-portal" },
        { title: "Parent Portal", path: "/parent-portal" },
        { title: "Staff Portal", path: "/staff-portal" }
      ],
      copyright: "© 2024 Delhi Public School. All rights reserved."
    }
  };

  const [contactData, setContactData] = useState(defaultData);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await fetch('/api/admin/contact-info');
      const data = await response.json();
      if (data) {
        setContactData(data);
      }
    } catch (error) {
      console.error('Failed to load contact information');
      // Keep using default data if API fails
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.footer 
      className="main-footer"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="footer-container">
        <div className="footer-logo-space" />
        
        <motion.div className="footer-section contact-section" variants={itemVariants}>
          <h3>Contact Information</h3>
          <div className="contact-info">
            <p><i className="fas fa-map-marker-alt"></i> {contactData?.address}</p>
            {contactData?.phones?.map((phone, idx) => (
              <p key={idx} className="contact-item">
                <i className="fas fa-phone"></i>
                <span>{phone.number}</span>
                <span className="contact-type">({phone.type})</span>
              </p>
            ))}
            {contactData?.emails?.map((email, idx) => (
              <p key={idx} className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{email.address}</span>
                <span className="contact-type">({email.type})</span>
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div className="footer-section links-section" variants={itemVariants}>
          <h3>Quick Links</h3>
          <div className="links-grid">
            {contactData.footerContent.quickLinks.map((link, idx) => (
              <Link key={idx} to={link.path} className="footer-link">
                <i className="fas fa-chevron-right"></i>
                {link.title}
              </Link>
            ))}
            {contactData.footerContent.extraLinks.map((link, idx) => (
              <Link key={`extra-${idx}`} to={link.path} className="footer-link">
                <i className="fas fa-external-link-alt"></i>
                {link.title}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div className="footer-section map-section" variants={itemVariants}>
          <h3>Location</h3>
          <div className="map-wrapper">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerClassName="google-map"
                center={contactData.location}
                zoom={15}
                options={{
                  styles: [{ /* Add custom map styles here */ }],
                  disableDefaultUI: true,
                  zoomControl: true
                }}
              >
                <Marker position={contactData.location} />
              </GoogleMap>
            </LoadScript>
          </div>
        </motion.div>

        <motion.div className="footer-section social-section" variants={itemVariants}>
          <h3>Connect With Us</h3>
          <div className="social-icons-container">
            <div className="social-icons">
              {Object.entries(contactData.footerContent.socialMedia).map(([platform, data]) => (
                <motion.a
                  key={platform}
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className={data.icon}></i>
                  <span className="social-platform">{platform}</span>
                </motion.a>
              ))}
            </div>
          </div>
          <div className="newsletter-signup">
            <h4>Subscribe to Newsletter</h4>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </div>
            <p className="newsletter-info">Stay updated with our latest news and events</p>
          </div>
        </motion.div>
      </div>

      <motion.div className="footer-bottom" variants={itemVariants}>
        <div className="footer-bottom-content">
          <p>{contactData?.footerContent?.copyright}</p>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
