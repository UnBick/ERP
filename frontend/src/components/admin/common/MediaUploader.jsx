import React, { useState } from 'react';
import { toast } from 'react-toastify';

const MediaUploader = ({ files, onChange, validationRules, multiple = true }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    
    if (validationRules) {
      const errors = validateFiles(uploadedFiles, validationRules);
      if (errors.length) {
        errors.forEach(error => toast.error(error));
        return;
      }
    }

    setUploading(true);
    try {
      // Handle file upload logic
      onChange(uploadedFiles);
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-uploader">
      <input
        type="file"
        onChange={handleUpload}
        multiple={multiple}
        accept="image/*,video/*"
        disabled={uploading}
      />
      {uploading && <div className="upload-progress">Uploading...</div>}
    </div>
  );
};

export default MediaUploader;
