import React from 'react';
import ActivityCard from './ActivityCard';

const CategorySection = ({ category, activities, onEdit }) => {
  return (
    <div className="category-section">
      <h3>{category}</h3>
      <div className="activities-grid">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={() => onEdit(activity)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
