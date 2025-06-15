import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import DatePicker from '../../../common/DatePicker';
import './styles/Assemblies.css';

const Assemblies = () => {
  const [assemblies, setAssemblies] = useState([]);
  const [selectedAssembly, setSelectedAssembly] = useState(null);
  const [classes, setClasses] = useState([]);

  const validationRules = {
    assembly: {
      required: ['date', 'class', 'theme', 'participants'],
      schedule: { required: true },
      images: { max: 5 }
    }
  };

  const handleSubmit = async (assemblyData) => {
    try {
      // API call to save assembly
      toast.success('Assembly details saved');
      setSelectedAssembly(null);
    } catch (error) {
      toast.error('Failed to save assembly details');
    }
  };

  return (
    <AdminLayout title="School Assemblies">
      <div className="assemblies-manager">
        <div className="schedule-calendar">
          <DatePicker
            value={selectedAssembly?.date}
            onChange={(date) => setSelectedAssembly({ date })}
            highlightDates={assemblies.map(a => a.date)}
          />
        </div>

        {selectedAssembly && (
          <AssemblyEditor
            assembly={selectedAssembly}
            classes={classes}
            onSave={handleSubmit}
            onCancel={() => setSelectedAssembly(null)}
            validationRules={validationRules.assembly}
          />
        )}

        <div className="assemblies-list">
          {assemblies.map(assembly => (
            <AssemblyCard
              key={assembly.id}
              assembly={assembly}
              onEdit={() => setSelectedAssembly(assembly)}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Assemblies;
