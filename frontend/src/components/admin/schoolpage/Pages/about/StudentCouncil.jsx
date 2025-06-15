import React, { useState } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import './styles/StudentCouncil.css';

const StudentCouncil = () => {
  const [councilMembers, setCouncilMembers] = useState([]);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    class: '',
    photo: null,
    responsibilities: ''
  });

  const validateMember = (member) => {
    const errors = {};
    if (!member.name) errors.name = 'Name is required';
    if (!member.role) errors.role = 'Role is required';
    if (!member.class) errors.class = 'Class is required';
    return errors;
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    const errors = validateMember(memberForm);
    
    if (Object.keys(errors).length === 0) {
      setCouncilMembers([...councilMembers, { ...memberForm, id: Date.now() }]);
      setMemberForm({ name: '', role: '', class: '', photo: null, responsibilities: '' });
    }
  };

  return (
    <AdminContentLayout pageType="student-council">
      <div className="student-council-manager">
        <form onSubmit={handleMemberSubmit} className="member-form">
          <h3>Add Council Member</h3>
          {/* Member form fields */}
        </form>

        <div className="council-members-grid">
          {councilMembers.map(member => (
            <div key={member.id} className="member-card">
              {/* Member display */}
            </div>
          ))}
        </div>
      </div>
    </AdminContentLayout>
  );
};

export default StudentCouncil;
