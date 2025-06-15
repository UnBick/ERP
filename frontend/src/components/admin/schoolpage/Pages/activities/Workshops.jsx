import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import MediaUploader from '../../../common/MediaUploader';
import { toast } from 'react-toastify';
import './styles/Workshops.css';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationRules = {
    title: { required: true, minLength: 5 },
    date: { required: true },
    description: { required: true, minLength: 50 },
    images: { required: true, min: 1, max: 5 }
  };

  const handleSave = async (workshopData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/activities/workshops', {
        method: selectedWorkshop?.id ? 'PUT' : 'POST',
        body: JSON.stringify(workshopData)
      });
      if (!response.ok) throw new Error('Failed to save workshop');
      toast.success('Workshop saved successfully');
      setSelectedWorkshop(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Workshops Management">
      <div className="workshops-manager">
        {/* Workshop editing interface */}
        {selectedWorkshop ? (
          <WorkshopEditor
            workshop={selectedWorkshop}
            onSave={handleSave}
            onCancel={() => setSelectedWorkshop(null)}
            validationRules={validationRules}
            loading={loading}
          />
        ) : (
          <WorkshopsList
            workshops={workshops}
            onEdit={setSelectedWorkshop}
            onAdd={() => setSelectedWorkshop({})}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default Workshops;
