import React, { useState, useEffect } from 'react';
import { academicService } from '../../../../../services/api/academicService';
import { handleError } from '../../../../../services/errorHandler';
import { API_ENDPOINTS } from '../../../../../config/apiConfig';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import PDFViewer from '../../../common/PDFViewer';
import './styles/SyllabusManager.css';

const SyllabusManager = () => {
  const [activeClass, setActiveClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [subjectData, setSubjectData] = useState({
    title: '',
    subject: '',
    description: ''
  });
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const grades = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const validationRules = {
    pdf: {
      maxSize: 10000000, // 10MB
      required: ['title', 'subject', 'class']
    }
  };

  useEffect(() => {
    fetchSyllabusData();
  }, [activeClass]);

  const fetchSyllabusData = async () => {
    try {
      setLoading(true);
      const data = await academicService.getSyllabus(activeClass);
      setSyllabusData(data);
    } catch (error) {
      toast.error('Failed to load syllabus data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file.size > validationRules.pdf.maxSize) {
      setErrors({ file: 'File size must be less than 10MB' });
      return;
    }
    setSelectedFile(file);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    validationRules.pdf.required.forEach(field => {
      if (!subjectData[field]) {
        newErrors[field] = `${field} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('data', JSON.stringify(subjectData));

      const response = await fetch('/api/admin/syllabi', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save syllabus');
      
      await fetchSyllabusData(); // Refresh data
      // Reset form
      setSelectedFile(null);
      setSubjectData({ title: '', subject: '', description: '' });
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <AdminContentLayout pageType="syllabus">
      <div className="syllabus-manager">
        <div className="class-selector">
          {grades.map(grade => (
            <button
              key={grade}
              onClick={() => setActiveClass(grade)}
              className={activeClass === grade ? 'active' : ''}
            >
              Class {grade}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading syllabus data...</div>
        ) : (
          <div className="subject-syllabus">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={subjectData.title}
                  onChange={(e) => setSubjectData({...subjectData, title: e.target.value})}
                  placeholder="Syllabus Title"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <select
                  value={subjectData.subject}
                  onChange={(e) => setSubjectData({...subjectData, subject: e.target.value})}
                  className={errors.subject ? 'error' : ''}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                {errors.file && <span className="error-message">{errors.file}</span>}
              </div>

              <div className="preview-section">
                {selectedFile && (
                  <PDFViewer
                    file={selectedFile}
                    validationRules={validationRules}
                  />
                )}
              </div>

              <button type="submit" className="submit-btn">
                Save Changes
              </button>
              {errors.submit && <span className="error-message">{errors.submit}</span>}
            </form>

            <div className="existing-syllabi">
              <h3>Existing Syllabi</h3>
              <div className="syllabi-grid">
                {syllabusData.map(syllabus => (
                  <div key={syllabus.id} className="syllabus-item">
                    <h4>{syllabus.subjectName}</h4>
                    <p>{syllabus.content}</p>
                    <div className="actions">
                      <button onClick={() => handleEdit(syllabus)}>Edit</button>
                      <button onClick={() => handleDelete(syllabus.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminContentLayout>
  );
};

export default SyllabusManager;
