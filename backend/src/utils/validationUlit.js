// src/utils/validationUtil.js

/**
 * Validate an email address
 * @param {String} email - The email address to validate
 * @returns {Boolean} - True if the email is valid, false otherwise
 */
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  /**
   * Validate a password (minimum 8 characters, at least one letter and one number)
   * @param {String} password - The password to validate
   * @returns {Boolean} - True if the password is valid, false otherwise
   */
  const validatePassword = (password) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(String(password));
  };
  
  module.exports = {
    validateEmail,
    validatePassword,
  };