import React, { useEffect, useState } from 'react';
import './styles/ChangeTracker.css';

const ChangeTracker = ({ originalContent, currentContent }) => {
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    const trackChanges = () => {
      const changedFields = [];
      Object.keys(currentContent).forEach(key => {
        if (JSON.stringify(originalContent[key]) !== JSON.stringify(currentContent[key])) {
          changedFields.push({
            field: key,
            oldValue: originalContent[key],
            newValue: currentContent[key]
          });
        }
      });
      setChanges(changedFields);
    };

    trackChanges();
  }, [originalContent, currentContent]);

  if (changes.length === 0) return null;

  return (
    <div className="change-tracker">
      <h4>Pending Changes</h4>
      <div className="changes-list">
        {changes.map((change, index) => (
          <div key={index} className="change-item">
            <span className="field-name">{change.field}</span>
            <div className="change-details">
              <div className="old-value">
                <label>Old:</label>
                <span>{JSON.stringify(change.oldValue)}</span>
              </div>
              <div className="new-value">
                <label>New:</label>
                <span>{JSON.stringify(change.newValue)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChangeTracker;
