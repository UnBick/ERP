import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
//import SportsEditor from '../../../common/SportsEditor';
import { toast } from 'react-toastify';
import './styles/Sports.css';

const Sports = () => {
  const [categories] = useState([
    { id: 'indoor', label: 'Indoor Sports' },
    { id: 'outdoor', label: 'Outdoor Sports' },
    { id: 'achievements', label: 'Sports Achievements' },
    { id: 'facilities', label: 'Sports Facilities' }
  ]);

  const [activeCategory, setActiveCategory] = useState('indoor');
  const [sportsData, setSportsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchSportsData();
  }, []);

  const fetchSportsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sports/content');
      const data = await response.json();
      setSportsData(data);
    } catch (error) {
      toast.error('Failed to load sports data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (categoryId, content) => {
    try {
      const response = await fetch(`/api/sports/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setSportsData(prev => ({
        ...prev,
        [categoryId]: content
      }));
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  return (
    <AdminLayout title="Sports Management">
      <div className="sports-editor">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading sports content...</div>
        ) : (
          <>
            <div className="content-editor">
              <SportsEditor 
                category={activeCategory}
                content={sportsData[activeCategory]}
                onSave={(content) => handleSave(activeCategory, content)}
                onPreview={(content) => setPreview(content)}
                validationRules={{
                  required: ['title', 'description'],
                  images: { min: 1, max: 5 },
                  description: { minLength: 100 }
                }}
              />
            </div>

            {preview && (
              <div className="preview-pane">
                <h3>Preview</h3>
                <button 
                  className="close-preview"
                  onClick={() => setPreview(null)}
                >
                  Close
                </button>
                <div className="preview-content">
                  <h4>{preview.title}</h4>
                  <p>{preview.description}</p>
                  <div className="preview-images">
                    {preview.images?.map((img, idx) => (
                      <img key={idx} src={img.url} alt={img.alt || 'Preview'} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Sports;
