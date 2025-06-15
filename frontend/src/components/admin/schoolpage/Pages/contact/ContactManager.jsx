import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import MapEditor from '../../../common/MapEditor';
import { toast } from 'react-toastify';
import './styles/ContactManager.css';

const ContactManager = () => {
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phones: [{ type: 'main', number: '' }],
    emails: [{ type: 'general', address: '' }],
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    location: { lat: 0, lng: 0 },
    operatingHours: {
      weekdays: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '13:00' },
      sunday: { isOpen: false }
    },
    footerContent: {
      quickLinks: [
        { title: 'About Us', path: '/about' },
        { title: 'Curriculum', path: '/academics/curriculum' },
        { title: 'Student Clubs', path: '/activities/clubs' },
        { title: 'Contact', path: '/contact' }
      ],
      socialMedia: {
        facebook: { url: '', icon: 'fab fa-facebook' },
        twitter: { url: '', icon: 'fab fa-twitter' },
        instagram: { url: '', icon: 'fab fa-instagram' },
        linkedin: { url: '', icon: 'fab fa-linkedin' },
        youtube: { url: '', icon: 'fab fa-youtube' }
      },
      copyright: '© 2024 School Management System. All rights reserved.'
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact-info');
      const data = await response.json();
      setContactInfo(data);
    } catch (error) {
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!contactInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!contactInfo.phones.some(p => p.number.trim())) {
      newErrors.phones = 'At least one phone number is required';
    }
    if (!contactInfo.emails.some(e => e.address.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))) {
      newErrors.emails = 'Valid email address is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await fetch('/api/admin/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      });

      if (!response.ok) throw new Error('Failed to update');
      toast.success('Contact information updated successfully');
    } catch (error) {
      toast.error('Failed to update contact information');
    }
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...contactInfo.phones];
    updatedPhones[index].number = value;
    setContactInfo({ ...contactInfo, phones: updatedPhones });
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...contactInfo.emails];
    updatedEmails[index].address = value;
    setContactInfo({ ...contactInfo, emails: updatedEmails });
  };

  const handleQuickLinkUpdate = (index, field, value) => {
    const updatedLinks = [...contactInfo.footerContent.quickLinks];
    updatedLinks[index][field] = value;
    setContactInfo({ ...contactInfo, footerContent: { ...contactInfo.footerContent, quickLinks: updatedLinks } });
  };

  const handleRemoveQuickLink = (index) => {
    const updatedLinks = contactInfo.footerContent.quickLinks.filter((_, i) => i !== index);
    setContactInfo({ ...contactInfo, footerContent: { ...contactInfo.footerContent, quickLinks: updatedLinks } });
  };

  const handleAddQuickLink = () => {
    const updatedLinks = [...contactInfo.footerContent.quickLinks, { title: '', path: '' }];
    setContactInfo({ ...contactInfo, footerContent: { ...contactInfo.footerContent, quickLinks: updatedLinks } });
  };

  const handleSocialMediaUpdate = (platform, value) => {
    setContactInfo({
      ...contactInfo,
      footerContent: {
        ...contactInfo.footerContent,
        socialMedia: {
          ...contactInfo.footerContent.socialMedia,
          [platform]: { ...contactInfo.footerContent.socialMedia[platform], url: value }
        }
      }
    });
  };

  const handleCopyrightUpdate = (value) => {
    setContactInfo({
      ...contactInfo,
      footerContent: {
        ...contactInfo.footerContent,
        copyright: value
      }
    });
  };

  return (
    <AdminContentLayout pageType="contact">
      <div className="contact-manager">
        <div className="actions">
          <button onClick={() => setPreview(!preview)}>
            {preview ? 'Edit Mode' : 'Preview'}
          </button>
          {!preview && (
            <button onClick={handleSubmit}>Save Changes</button>
          )}
        </div>

        {preview ? (
          <div className="preview-mode">
            {/* Preview content */}
            <div className="contact-preview">
              <h3>Contact Information</h3>
              <p>{contactInfo.address}</p>
              <div className="contact-details">
                {contactInfo.phones.map((phone, idx) => (
                  <p key={idx}>{phone.type}: {phone.number}</p>
                ))}
                {contactInfo.emails.map((email, idx) => (
                  <p key={idx}>{email.type}: {email.address}</p>
                ))}
              </div>
              <div className="social-links">
                {Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
                  url && <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Address Information</h3>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                placeholder="School Address"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
              
              <MapEditor
                location={contactInfo.location}
                onLocationChange={(location) => setContactInfo({...contactInfo, location})}
              />
            </div>

            <div className="form-section">
              <h3>Contact Details</h3>
              {contactInfo.phones.map((phone, index) => (
                <div key={index} className="input-group">
                  <select
                    value={phone.type}
                    onChange={(e) => {
                      const updatedPhones = [...contactInfo.phones];
                      updatedPhones[index].type = e.target.value;
                      setContactInfo({...contactInfo, phones: updatedPhones});
                    }}
                  >
                    <option value="main">Main</option>
                    <option value="admission">Admission</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <input
                    type="tel"
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className={errors.phones ? 'error' : ''}
                  />
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3>Social Media</h3>
              {Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
                <div key={platform} className="input-group">
                  <label>{platform}</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialMedia: {
                        ...contactInfo.socialMedia,
                        [platform]: e.target.value
                      }
                    })}
                    placeholder={`${platform} URL`}
                  />
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3>Footer Content</h3>
              <div className="footer-links-editor">
                <h4>Quick Links</h4>
                {contactInfo.footerContent.quickLinks.map((link, index) => (
                  <div key={index} className="link-item">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => handleQuickLinkUpdate(index, 'title', e.target.value)}
                      placeholder="Link Title"
                    />
                    <input
                      type="text"
                      value={link.path}
                      onChange={(e) => handleQuickLinkUpdate(index, 'path', e.target.value)}
                      placeholder="Link Path"
                    />
                    <button onClick={() => handleRemoveQuickLink(index)}>Remove</button>
                  </div>
                ))}
                <button onClick={handleAddQuickLink}>Add Quick Link</button>
              </div>

              <div className="social-media-editor">
                <h4>Social Media Links</h4>
                {Object.entries(contactInfo.footerContent.socialMedia).map(([platform, data]) => (
                  <div key={platform} className="social-media-item">
                    <i className={data.icon}></i>
                    <input
                      type="url"
                      value={data.url}
                      onChange={(e) => handleSocialMediaUpdate(platform, e.target.value)}
                      placeholder={`${platform} URL`}
                    />
                  </div>
                ))}
              </div>

              <div className="copyright-editor">
                <h4>Copyright Text</h4>
                <input
                  type="text"
                  value={contactInfo.footerContent.copyright}
                  onChange={(e) => handleCopyrightUpdate(e.target.value)}
                  placeholder="Copyright Text"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminContentLayout>
  );
};

export default ContactManager;
