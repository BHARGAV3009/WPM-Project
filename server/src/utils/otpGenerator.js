const crypto = require('crypto');

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP (default: 4)
 * @returns {string} - Generated OTP
 */
const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }
  
  return otp;
};

/**
 * Verify if OTP is expired
 * @param {Date} createdAt - OTP creation timestamp
 * @param {number} expiryMinutes - Expiry time in minutes (default: 5)
 * @returns {boolean} - True if OTP is expired
 */
const isOTPExpired = (createdAt, expiryMinutes = 5) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const elapsedSeconds = (now - createdTime) / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  
  return elapsedMinutes > expiryMinutes;
};

/**
 * Get remaining time for OTP
 * @param {Date} createdAt - OTP creation timestamp
 * @param {number} expiryMinutes - Expiry time in minutes (default: 5)
 * @returns {number} - Remaining seconds
 */
const getRemainingTime = (createdAt, expiryMinutes = 5) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const elapsedSeconds = (now - createdTime) / 1000;
  const totalSeconds = expiryMinutes * 60;
  const remainingSeconds = totalSeconds - elapsedSeconds;
  
  return Math.max(0, Math.ceil(remainingSeconds));
};

/**
 * Format remaining time to readable format
 * @param {number} seconds - Remaining seconds
 * @returns {string} - Formatted time string (e.g., "4:32")
 */
const formatRemainingTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

module.exports = {
  generateOTP,
  isOTPExpired,
  getRemainingTime,
  formatRemainingTime
};