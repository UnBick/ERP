import React, { useState } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import GalleryManager from '../../../common/GalleryManager';
import FacilityEditor from '../../../common/FacilityEditor';
import './styles/Infrastructure.css';

const Infrastructure = () => {
  const [facilities, setFacilities] = useState([
    { id: 'classrooms', title: 'Classrooms', images: [], description: '' },
    { id: 'labs', title: 'Laboratories', images: [], description: '' },
    { id: 'library', title: 'Library', images: [], description: '' },
    { id: 'sports', title: 'Sports Facilities', images: [], description: '' }
  ]);

  const [selectedFacility, setSelectedFacility] = useState(null);

  const validationRules = {
    facility: {
      images: { min: 2, max: 10 },
      description: { minLength: 100, maxLength: 500 }
    }
  };

  return (
    <AdminLayout title="Infrastructure Management">
      <div className="infrastructure-manager">
        <div className="facilities-grid">
          {facilities.map(facility => (
            <div 
              key={facility.id} 
              className="facility-card"
              onClick={() => setSelectedFacility(facility)}
            >
              {/* Facility card content */}
            </div>
          ))}
        </div>

        {selectedFacility && (
          <div className="facility-editor">
            <FacilityEditor
              facility={selectedFacility}
              onSave={(updatedFacility) => {
                setFacilities(prev => 
                  prev.map(f => f.id === updatedFacility.id ? updatedFacility : f)
                );
              }}
              validationRules={validationRules}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Infrastructure;
