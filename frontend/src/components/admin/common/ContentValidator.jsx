import React from 'react';
import './styles/ContentValidator.css';

const ContentValidator = ({ content, rules }) => {
  const validateContent = () => {
    const errors = [];
    
    // Check for empty required fields
    if (rules.required) {
      rules.required.forEach(field => {
        if (!content[field]?.trim()) {
          errors.push(`${field} is required`);
        }
      });
    }

    // Check image dimensions
    if (rules.images) {
      rules.images.forEach(rule => {
        const image = content[rule.field];
        if (image) {
          if (image.width < rule.minWidth || image.height < rule.minHeight) {
            errors.push(`${rule.field} must be at least ${rule.minWidth}x${rule.minHeight}px`);
          }
        }
      });
    }

    // Check text length
    if (rules.textLength) {
      rules.textLength.forEach(rule => {
        const text = content[rule.field];
        if (text) {
          if (text.length < rule.min || text.length > rule.max) {
            errors.push(`${rule.field} must be between ${rule.min} and ${rule.max} characters`);
          }
        }
      });
    }

    return errors;
  };

  const errors = validateContent();

  return errors.length > 0 ? (
    <div className="validation-errors">
      <h4>Please fix the following issues:</h4>
      <ul>
        {errors.map((error, index) => (
          <li key={index} className="error-item">
            ⚠️ {error}
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

export default ContentValidator;
