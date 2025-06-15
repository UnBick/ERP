// src/utils/dateUtil.js
const moment = require('moment');

/**
 * Format a date to a specific format
 * @param {Date} date - Date object
 * @param {String} format - Desired format (default is 'YYYY-MM-DD')
 * @returns {String} - Formatted date string
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

/**
 * Get the current date in a specific format
 * @param {String} format - Desired format (default is 'YYYY-MM-DD')
 * @returns {String} - Formatted current date string
 */
const getCurrentDate = (format = 'YYYY-MM-DD') => {
  return moment().format(format);
};

module.exports = {
  formatDate,
  getCurrentDate,
};