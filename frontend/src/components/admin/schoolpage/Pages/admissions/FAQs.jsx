import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './styles/FAQs.css';

const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories] = useState([
    'General', 'Admission Process', 'Fee Structure', 'Documents'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [editingFaq, setEditingFaq] = useState(null);
  const [errors, setErrors] = useState({});

  const validationRules = {
    faq: {
      question: { minLength: 10 },
      answer: { minLength: 20 },
      required: ['question', 'answer', 'category']
    }
  };

  const handleSave = async (faqData) => {
    const validationErrors = validateFaq(faqData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // API call to save FAQ
      setEditingFaq(null);
      toast.success('FAQ saved successfully');
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  return (
    <AdminContentLayout pageType="faqs">
      <div className="faq-manager">
        <div className="category-selector">
          {/* Category selection */}
        </div>

        {editingFaq ? (
          <div className="faq-editor">
            <input
              value={editingFaq.question}
              onChange={(e) => setEditingFaq({
                ...editingFaq,
                question: e.target.value
              })}
              className={errors.question ? 'error' : ''}
            />
            {errors.question && (
              <span className="error-message">{errors.question}</span>
            )}
            {/* More editing fields */}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* FAQ list with drag-drop reordering */}
          </DragDropContext>
        )}
      </div>
    </AdminContentLayout>
  );
};

export default FAQs;