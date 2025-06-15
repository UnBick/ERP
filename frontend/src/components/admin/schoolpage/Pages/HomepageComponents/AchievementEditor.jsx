import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import IconPicker from '../../../common/IconPicker';
import NumberInput from '../../../common/NumberInput';
import AnimatedCounter from '../../../common/AnimatedCounter';
import { toast } from 'react-toastify';
import ValidationMessage from '../../../common/ValidationMessage';
import './styles/AchievementEditor.css';

const AchievementEditor = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievements)
      });
      toast.success('Achievements saved successfully');
    } catch (error) {
      toast.error('Failed to save achievements');
    }
  };

  const validateAchievement = (achievement) => {
    const errors = {};
    if (!achievement.title) errors.title = 'Title is required';
    if (!achievement.count) errors.count = 'Count is required';
    if (achievement.count < 0) errors.count = 'Count must be positive';
    return errors;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(achievements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAchievements(items);
  };

  return (
    <div className="achievement-editor">
      <div className="editor-actions">
        <button onClick={() => setPreview(!preview)}>
          {preview ? 'Edit Mode' : 'Preview'}
        </button>
        <button onClick={handleSave}>Save Changes</button>
      </div>

      {loading ? (
        <div className="loading">Loading achievements...</div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="achievements">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {achievements.map((achievement, index) => (
                  <Draggable 
                    key={index} 
                    draggableId={`achievement-${index}`} 
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="achievement-item"
                      >
                        {/* Achievement form fields */}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {preview && (
        <div className="achievement-preview">
          {/* Preview content */}
        </div>
      )}
    </div>
  );
};

export default AchievementEditor;
