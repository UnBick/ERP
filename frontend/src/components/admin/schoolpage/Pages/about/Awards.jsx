import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import AwardForm from '../../../common/AwardForm';
import ImageGallery from '../../../common/ImageGallery';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import './styles/Awards.css';

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [selectedAward, setSelectedAward] = useState(null);
  const [categories] = useState([
    'Academic', 'Sports', 'Cultural', 'Innovation'
  ]);

  const validationRules = {
    award: {
      required: ['title', 'year', 'category', 'description'],
      images: { max: 5 },
      description: { maxLength: 500 }
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    // Reordering logic
  };

  return (
    <AdminLayout 
      title="Awards & Recognition"
      backButton={!!selectedAward}
      onBack={() => setSelectedAward(null)}
    >
      <div className="awards-manager">
        <div className="awards-container">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="categories-grid">
              {categories.map(category => (
                <div key={category} className="category-column">
                  <h3>{category}</h3>
                  <Droppable droppableId={category}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="awards-list"
                      >
                        {/* Awards list */}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>

          {selectedAward && (
            <AwardForm
              award={selectedAward}
              onSave={handleSaveAward}
              validationRules={validationRules}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Awards;
