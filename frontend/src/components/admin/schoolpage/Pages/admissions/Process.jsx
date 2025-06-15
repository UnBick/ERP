import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import './styles/Process.css';

const Process = () => {
  const [steps, setSteps] = useState([]);
  const [editingStep, setEditingStep] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/admissions/process');
      const data = await response.json();
      setSteps(data);
    } catch (error) {
      toast.error('Failed to load admission process');
    } finally {
      setLoading(false);
    }
  };

  const handleStepSave = async (stepData) => {
    const errors = validateStep(stepData);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admissions/process', {
        method: stepData.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData)
      });
      
      if (!response.ok) throw new Error();
      
      await fetchSteps();
      setEditingStep(null);
      toast.success('Step saved successfully');
    } catch (error) {
      toast.error('Failed to save step');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const reorderedSteps = Array.from(steps);
    const [removed] = reorderedSteps.splice(result.source.index, 1);
    reorderedSteps.splice(result.destination.index, 0, removed);

    try {
      await fetch('/api/admissions/process/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: reorderedSteps })
      });
      setSteps(reorderedSteps);
    } catch (error) {
      toast.error('Failed to reorder steps');
    }
  };

  return (
    <AdminContentLayout pageType="admission-process">
      <div className="process-editor">
        <div className="actions">
          <button onClick={() => setEditingStep({})}>Add New Step</button>
        </div>

        {editingStep ? (
          <StepEditor
            step={editingStep}
            onSave={handleStepSave}
            onCancel={() => setEditingStep(null)}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {steps.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="step-card"
                        >
                          <h3>{step.title}</h3>
                          <p>{step.description}</p>
                          <div className="actions">
                            <button onClick={() => setEditingStep(step)}>Edit</button>
                            <button onClick={() => handleDelete(step.id)}>Delete</button>
                          </div>
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
      </div>
    </AdminContentLayout>
  );
};

export default Process;
