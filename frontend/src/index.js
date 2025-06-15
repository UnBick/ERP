import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './components/admin/styles.css';
import './components/parent/styles.css';
import './components/student/styles.css';
import './components/teacher/styles.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();