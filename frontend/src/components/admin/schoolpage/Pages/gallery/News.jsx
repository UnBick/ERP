import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import RichTextEditor from '../../../common/RichTextEditor';
import ImageUploader from '../../../common/ImageUploader';
import { toast } from 'react-toastify';
import './styles/News.css';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);

  const validateNews = (newsData) => {
    const errors = {};
    if (!newsData.title?.trim()) errors.title = 'Title is required';
    if (!newsData.content?.trim()) errors.content = 'Content is required';
    if (!newsData.coverImage) errors.coverImage = 'Cover image is required';
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateNews(selectedNews);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      // API call to save news
      toast.success('News saved successfully');
      setSelectedNews(null);
    } catch (error) {
      toast.error('Failed to save news');
    }
  };

  return (
    <AdminLayout title="News Manager">
      <div className="news-manager">
        {/* News editing interface */}
      </div>
    </AdminLayout>
  );
};

export default News;
