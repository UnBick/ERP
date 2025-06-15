// src/utils/loggerUtil.js

/**
 * Log an info message
 * @param {String} message - The message to log
 */
const logInfo = (message) => {
    console.log(`INFO: ${message}`);
  };
  
  /**
   * Log an error message
   * @param {String} message - The message to log
   */
  const logError = (message) => {
    console.error(`ERROR: ${message}`);
  };
  
  module.exports = {
    logInfo,
    logError,
  };