import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import DatePicker from '../../../common/DatePicker';
import MediaUploader from '../../../common/MediaUploader';
import { toast } from 'react-toastify';
import './styles/Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const validateEvent = (eventData) => {
    const errors = {};
    if (!eventData.title) errors.title = 'Title is required';
    if (!eventData.date) errors.date = 'Date is required';
    if (!eventData.description) errors.description = 'Description is required';
    if (!eventData.images?.length) errors.images = 'At least one image is required';
    return errors;
  };

  const handleSave = async (eventData) => {
    const validationErrors = validateEvent(eventData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`/api/gallery/events${eventData.id ? `/${eventData.id}` : ''}`, {
        method: eventData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error('Failed to save event');
      toast.success('Event saved successfully');
      setSelectedEvent(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AdminLayout title="Event Gallery">
      {/* Event editing form and preview components */}
    </AdminLayout>
  );
};

export default Events;
