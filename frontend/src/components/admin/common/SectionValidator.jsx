import React from 'react';
import './styles/SectionValidator.css';

const SectionValidator = ({ content, rules, section }) => {
  const validateContent = () => {
    const errors = [];

    // Check required fields
    if (rules.required) {
      rules.required.forEach(field => {
        const value = content[field];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors.push(`${field} is required for ${section}`);
        }
      });
    }

    // Check minimum items
    if (rules.minItems) {
      Object.entries(rules.minItems).forEach(([field, min]) => {
        if (!Array.isArray(content[field]) || content[field].length < min) {
          errors.push(`${field} must have at least ${min} items`);
        }
      });
    }

    // Check image rules
    if (rules.imageRules && content.images) {
      content.images.forEach((image, index) => {
        if (image.width < rules.imageRules.minWidth || 
            image.height < rules.imageRules.minHeight) {
          errors.push(`Image ${index + 1} does not meet minimum dimensions`);
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
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

export default SectionValidator;
