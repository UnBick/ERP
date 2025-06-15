import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import DocumentUploader from '../../../common/DocumentUploader';
import PreviewModal from '../../../common/PreviewModal';
import './styles/MandatoryDisclosure.css';

const MandatoryDisclosure = () => {
  const [disclosureData, setDisclosureData] = useState({
    schoolInfo: {
      affiliationNumber: '',
      schoolCode: '',
      address: '',
      contact: ''
    },
    faculty: {
      teaching: { total: 0, categories: {} },
      nonTeaching: { total: 0, categories: {} }
    },
    infrastructure: {
      landArea: '',
      buildingArea: '',
      facilities: []
    },
    documents: []
  });

  const documentTypes = [
    { id: 'affiliation', label: 'Affiliation Certificate', required: true },
    { id: 'recognition', label: 'Recognition Certificate', required: true },
    { id: 'safety', label: 'Safety Certificates', required: true },
    { id: 'financial', label: 'Financial Statements', required: true }
  ];

  return (
    <AdminLayout title="Mandatory Disclosure">
      <div className="disclosure-manager">
        <div className="sections-container">
          <section className="basic-info">
            {/* School information form */}
          </section>

          <section className="documents-section">
            {documentTypes.map(docType => (
              <div key={docType.id} className="document-uploader">
                <h3>{docType.label}</h3>
                <DocumentUploader
                  type={docType.id}
                  required={docType.required}
                  currentDoc={disclosureData.documents.find(d => d.type === docType.id)}
                  onUpload={(doc) => {
                    setDisclosureData(prev => ({
                      ...prev,
                      documents: [
                        ...prev.documents.filter(d => d.type !== docType.id),
                        doc
                      ]
                    }));
                  }}
                />
              </div>
            ))}
          </section>
        </div>

        <div className="preview-controls">
          <button onClick={() => validateAndPublish()}>
            Validate & Publish
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MandatoryDisclosure;
