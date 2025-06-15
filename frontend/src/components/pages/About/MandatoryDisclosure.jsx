import React, { useState, useEffect } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/MandatoryDisclosure.css';

const MandatoryDisclosure = () => {
  const [disclosureData, setDisclosureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisclosure = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getMandatoryDisclosure();
        setDisclosureData(data);
      } catch (error) {
        setError('Failed to load disclosure data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDisclosure();
  }, []);

  const handleDocumentClick = (url) => {
    // Open document in new tab instead of using PDFViewer
    window.open(url, '_blank');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!disclosureData) return null;

  return (
    <div className="mandatory-disclosure">
      <h1>Mandatory Disclosure</h1>
      
      <div className="disclosure-sections">
        {/* Existing sections */}
        
        <section className="documents">
          <h2>Important Documents</h2>
          <div className="documents-grid">
            {disclosureData.documents?.map(doc => (
              <div 
                key={doc.id} 
                className="document-card"
                onClick={() => handleDocumentClick(doc.url)}
              >
                <i className="fas fa-file-pdf"></i>
                <h4>{doc.title}</h4>
                <span className="view-link">View Document</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MandatoryDisclosure;
