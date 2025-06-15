// utils/dateUtils.js

/**
 * Checks if two date ranges overlap.
 *
 * @param {Date | string} startDate1 - The start of the first date range.
 * @param {Date | string} endDate1 - The end of the first date range.
 * @param {Date | string} startDate2 - The start of the second date range.
 * @param {Date | string} endDate2 - The end of the second date range.
 * @returns {boolean} - Returns true if the date ranges overlap, false otherwise.
 */
const isDateOverlapping = (startDate1, endDate1, startDate2, endDate2) => {
  // Ensure inputs are Date objects
  const start1 = new Date(startDate1);
  const end1 = new Date(endDate1);
  const start2 = new Date(startDate2);
  const end2 = new Date(endDate2);

  // Two ranges overlap if the start of one range is less than or equal to the end of the other range
  // and vice versa.
  return start1 <= end2 && start2 <= end1;
};

module.exports = {
  isDateOverlapping
};