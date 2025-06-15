import React, { useState, useEffect } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import ImageCropper from '../../../common/ImageCropper';
import LoadingSpinner from '../../../common/LoadingSpinner';
import ImageOptimizer from '../../../common/ImageOptimizer';
import { toast } from 'react-toastify';
import ValidationMessage from '../../../common/ValidationMessage';
import './styles/GalleryEditor.css';

const GalleryEditor = () => {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleImageUpload = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      
      setSelectedGallery(prev => ({
        ...prev,
        images: [...prev.images, ...data.urls]
      }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`/api/gallery/${selectedGallery.id || ''}`, {
        method: selectedGallery.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedGallery)
      });
      
      await fetchGalleries();
      toast.success('Gallery saved successfully');
    } catch (error) {
      toast.error('Failed to save gallery');
    }
  };

  return (
    <div className="gallery-editor">
      {/* Gallery management interface */}
    </div>
  );
};

export default GalleryEditor;
