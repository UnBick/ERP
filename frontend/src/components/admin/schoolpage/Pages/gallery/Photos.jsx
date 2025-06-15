import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import MediaUploader from '../../../common/MediaUploader';
import AlbumManager from '../../../common/AlbumManager';
import { toast } from 'react-toastify';
import './styles/Photos.css';

const Photos = () => {
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const validationRules = {
    image: {
      maxSize: 5000000, // 5MB
      dimensions: { minWidth: 800, minHeight: 600 },
      formats: ['jpg', 'jpeg', 'png', 'webp']
    },
    album: {
      required: ['title', 'description'],
      maxPhotos: 50
    }
  };

  const handleSave = async (albumData) => {
    const errors = validateAlbum(albumData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/albums${albumData.id ? `/${albumData.id}` : ''}`, {
        method: albumData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumData)
      });

      if (!response.ok) throw new Error('Failed to save album');
      toast.success(albumData.id ? 'Album updated' : 'Album created');
      setActiveAlbum(null);
      fetchAlbums();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title={activeAlbum ? `Editing: ${activeAlbum.title}` : 'Photo Gallery'}
      backButton={!!activeAlbum}
      onBack={() => setActiveAlbum(null)}
    >
      <div className="photo-manager">
        <div className="actions">
          <button onClick={() => setActiveAlbum({})}>Create Album</button>
          {activeAlbum && (
            <>
              <button onClick={() => setPreview(activeAlbum)}>Preview</button>
              <button 
                onClick={() => handleSave(activeAlbum)}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
        {!activeAlbum ? (
          <AlbumManager 
            onAlbumSelect={setActiveAlbum}
            validationRules={validationRules.album}
          />
        ) : (
          <div className="album-editor">
            {/* Album editing interface */}
            <MediaUploader
              type="image"
              multiple={true}
              validationRules={validationRules.image}
              albumId={activeAlbum.id}
            />
          </div>
        )}
      </div>

      {preview && (
        <PreviewModal
          album={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </AdminLayout>
  );
};

export default Photos;
