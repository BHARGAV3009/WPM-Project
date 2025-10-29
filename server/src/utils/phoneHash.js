const crypto = require('crypto');

/**
 * Normalize phone number to be consistent regardless of format
 * Handles various formats: +91 9361945939, 91-9361945939, 9361945939, etc.
 * @param {string} phoneNumber - The phone number to normalize
 * @returns {string} - Normalized phone number (10 digits only for India, or without country code)
 */
const normalizePhoneNumber = (phoneNumber) => {
  // Remove all non-digits
  let normalized = phoneNumber.replace(/\D/g, '');
  
  // If it starts with country code (91 for India, 1 for US, etc.), keep it
  // But for Indian numbers, we accept both with and without country code
  if (normalized.length > 10 && normalized.startsWith('91') && normalized.length === 12) {
    // Indian number with country code: keep as is for consistency
    return normalized;
  } else if (normalized.length === 10 && !normalized.startsWith('91')) {
    // Indian number without country code - add it for consistency
    return '91' + normalized;
  }
  
  // For other formats, return as is
  return normalized;
};

/**
 * Hash a phone number for privacy-preserving contact discovery
 * @param {string} phoneNumber - The phone number to hash
 * @returns {string} - The hashed phone number
 */
const hashPhoneNumber = (phoneNumber) => {
  // Normalize the phone number
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  // Get salt from environment, with proper fallback
  const salt = process.env.PHONE_HASH_SALT || 'chatsapp_default_salt';
  
  // Create a SHA-256 hash
  const hash = crypto.createHash('sha256');
  hash.update(normalizedPhone + salt);
  
  return hash.digest('hex');
};

module.exports = { hashPhoneNumber, normalizePhoneNumber };