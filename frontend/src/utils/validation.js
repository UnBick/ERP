export const validateForm = (data, rules) => {
  const errors = {};

  if (rules.required) {
    rules.required.forEach(field => {
      if (!data[field]) {
        errors[field] = `${field} is required`;
      }
    });
  }

  if (rules.minLength) {
    Object.entries(rules.minLength).forEach(([field, length]) => {
      if (data[field] && data[field].length < length) {
        errors[field] = `Must be at least ${length} characters`;
      }
    });
  }

  if (rules.images) {
    if (data.images) {
      if (data.images.length < rules.images.min) {
        errors.images = `Minimum ${rules.images.min} images required`;
      }
      if (data.images.length > rules.images.max) {
        errors.images = `Maximum ${rules.images.max} images allowed`;
      }
    }
  }

  return errors;
};
