import React from 'react';
import './styles/ErrorMessage.css';

const ErrorMessage = ({ message, retry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">❌</div>
      <p>{message}</p>
      {retry && (
        <button onClick={retry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 