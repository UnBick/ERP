// Time-related constants and functions
// Generate time slots from 8 AM to 5 PM with 45-minute intervals
function generateTimeSlots() {
  const slots = [];
  const startHour = 8;
  const endHour = 17;
  const interval = 45; // 45 minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
  }
  return slots;
}

function generateAcademicYears(count = 5) {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => {
    const year = currentYear + i;
    return `${year}-${year + 1}`;
  });
}

// Constants
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const TIME_SLOTS = generateTimeSlots();
export const ACADEMIC_YEARS = generateAcademicYears();
export const CLASS_LEVELS = ['Primary', 'Secondary', 'Higher Secondary'];

// Validation functions
export const validateTimeSlots = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return end > start;
};

export const validateTimetable = (data) => {
  const errors = {};
  if (!data.classId) errors.classId = 'Class is required';
  if (!data.subjectId) errors.subjectId = 'Subject is required';
  if (!data.day) errors.day = 'Day is required';
  if (!data.startTime) errors.startTime = 'Start time is required';
  if (!data.endTime) errors.endTime = 'End time is required';
  return errors;
};

export const checkTimeConflict = (existingSlots, newSlot) => {
  return existingSlots.some(slot => {
    const newStart = new Date(`2000/01/01 ${newSlot.startTime}`);
    const newEnd = new Date(`2000/01/01 ${newSlot.endTime}`);
    const slotStart = new Date(`2000/01/01 ${slot.startTime}`);
    const slotEnd = new Date(`2000/01/01 ${slot.endTime}`);
    
    return (newStart < slotEnd && newEnd > slotStart);
  });
};

export const formatTimeSlot = (startTime, endTime) => {
  return `${startTime} - ${endTime}`;
};

export const validateClassData = (data) => {
  const errors = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Class name is required';
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.name = 'Class name must be between 2 and 50 characters';
  }

  // Level validation
  if (!data.level) {
    errors.level = 'Academic level is required';
  } else if (!academicLevels.includes(data.level)) {
    errors.level = 'Invalid academic level';
  }

  // Academic year validation
  if (!data.academicYear) {
    errors.academicYear = 'Academic year is required';
  } else if (!academicYears.includes(data.academicYear)) {
    errors.academicYear = 'Invalid academic year';
  }

  // Capacity validation
  if (!data.capacity) {
    errors.capacity = 'Capacity is required';
  } else {
    const cap = parseInt(data.capacity);
    if (isNaN(cap) || cap < 1 || cap > 100) {
      errors.capacity = 'Capacity must be between 1 and 100';
    }
  }

  // Description validation (optional)
  if (data.description && data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  // Class teacher validation (optional)
  if (data.classTeacher && data.classTeacher.length > 100) {
    errors.classTeacher = 'Class teacher name cannot exceed 100 characters';
  }

  return errors;
};

export const calculateEndTime = (startTime, durationMinutes = 45) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const academicLevels = [
  'Primary',
  'Middle',
  'Secondary',
  'Senior Secondary'
];

export const academicYears = [
  '2023-24',
  '2024-25',
  '2025-26'
];

export const validateSubjectData = (subjectData) => {
  const errors = {};
  if (!subjectData.name) errors.name = 'Subject name is required';
  if (!subjectData.code) errors.code = 'Subject code is required';
  return errors;
};
