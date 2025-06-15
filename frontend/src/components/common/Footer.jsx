import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Import your CSS for styling

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <Link to="/terms-of-service">Terms of Service</Link>
                </div>
                <div className="footer-info">
                    <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;