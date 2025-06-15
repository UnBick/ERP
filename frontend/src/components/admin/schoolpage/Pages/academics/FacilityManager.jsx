import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import ImageGallery from '../../../common/ImageGallery';
import ImageUploader from '../../../common/ImageUploader';
import { toast } from 'react-toastify';
import './styles/FacilityManager.css';

const FacilityManager = () => {
  const [facilities, setFacilities] = useState({
    classrooms: { title: 'Classrooms', images: [], description: '' },
    labs: { title: 'Laboratories', images: [], description: '' },
    library: { title: 'Library', images: [], description: '' },
    sports: { title: 'Sports Facilities', images: [], description: '' }
  });

  const [activePreview, setActivePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [staffInCharge, setStaffInCharge] = useState({});
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaffData();
    fetchFacilityData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const response = await fetch('/api/admin/staff/list');
      const data = await response.json();
      setStaffList(data.filter(staff => 
        staff.department === 'Facilities' || 
        staff.role.includes('Facility')
      ));
    } catch (error) {
      setErrors(prev => ({ ...prev, staff: 'Failed to load staff data' }));
    }
  };

  const fetchFacilityData = async () => {
    try {
      const response = await fetch('/api/admin/facilities');
      const data = await response.json();
      setFacilities(data);
      setStaffInCharge(data.reduce((acc, facility) => ({
        ...acc,
        [facility.id]: facility.staffInCharge
      }), {}));
    } catch (error) {
      setErrors(prev => ({ ...prev, facilities: 'Failed to load facility data' }));
    }
  };

  const validationRules = {
    images: { minCount: 2, maxCount: 8 },
    description: { minLength: 50, maxLength: 500 }
  };

  const validateFacility = (facility) => {
    const newErrors = {};
    
    if (facility.images.length < validationRules.images.minCount) {
      newErrors.images = `Minimum ${validationRules.images.minCount} images required`;
    }
    
    if (facility.description.length < validationRules.description.minLength) {
      newErrors.description = `Description must be at least ${validationRules.description.minLength} characters`;
    }

    return newErrors;
  };

  const handleUpdate = async (key, updatedFacility) => {
    const facilityErrors = validateFacility(updatedFacility);
    
    if (Object.keys(facilityErrors).length > 0) {
      setErrors({ ...errors, [key]: facilityErrors });
      return;
    }

    try {
      const response = await fetch(`/api/admin/facilities/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFacility,
          staffInCharge: staffInCharge[key]
        }),
      });

      if (!response.ok) throw new Error('Failed to update facility');
      
      setFacilities(prev => ({
        ...prev,
        [key]: updatedFacility
      }));
      toast.success('Facility updated successfully');
    } catch (error) {
      toast.error('Failed to update facility');
    }
  };

  return (
    <AdminContentLayout pageType="facilities">
      <div className="facility-manager">
        <div className="facilities-grid">
          {Object.entries(facilities).map(([key, facility]) => (
            <div key={key} className="facility-editor">
              <h3>{facility.title}</h3>
              
              <ImageUploader
                images={facility.images}
                onUpdate={(images) => handleUpdate(key, { ...facility, images })}
                validationRules={validationRules.images}
                errors={errors[key]?.images}
              />

              <textarea
                value={facility.description}
                onChange={(e) => handleUpdate(key, { ...facility, description: e.target.value })}
                placeholder="Facility description"
                className={errors[key]?.description ? 'error' : ''}
              />
              {errors[key]?.description && (
                <span className="error-message">{errors[key].description}</span>
              )}

              <div className="staff-assignment">
                <select
                  value={staffInCharge[key] || ''}
                  onChange={(e) => setStaffInCharge({
                    ...staffInCharge,
                    [key]: e.target.value
                  })}
                >
                  <option value="">Select Staff In-charge</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={() => setActivePreview(key)}>
                Preview Changes
              </button>
            </div>
          ))}
        </div>

        {activePreview && (
          <PreviewWrapper
            content={facilities[activePreview]}
            onClose={() => setActivePreview(null)}
          />
        )}
      </div>
    </AdminContentLayout>
  );
};

export default FacilityManager;
