/**
 * Encryption and Password Security Utilities
 * Handles password hashing, data encryption, and security operations
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ENCRYPTION, PASSWORD } = require('../config/security');

/**
 * Password hashing and validation
 */
class PasswordSecurity {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password) {
    try {
      const saltRounds = ENCRYPTION.BCRYPT_ROUNDS;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const errors = [];

    // Length check
    if (password.length < PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD.MIN_LENGTH} characters long`);
    }

    if (password.length > PASSWORD.MAX_LENGTH) {
      errors.push(`Password must be no more than ${PASSWORD.MAX_LENGTH} characters long`);
    }

    // Character requirements
    if (PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (PASSWORD.REQUIRE_SPECIAL) {
      const specialChars = PASSWORD.SPECIAL_CHARS.replace(/[[\]\\-]/g, '\\$&');
      const specialRegex = new RegExp(`[${specialChars}]`);
      if (!specialRegex.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    // Common password patterns
    const commonPatterns = [
      /(.)\1{3,}/, // Repeated characters
      /123456|654321|abcdef|qwerty/i, // Sequential patterns
      /password|admin|user|guest/i // Common words
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns and is not secure');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculate password strength score (0-100)
   */
  static calculatePasswordStrength(password) {
    let score = 0;

    // Length bonus
    score += Math.min(password.length * 4, 25);

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 15; // Sequential patterns

    // Entropy bonus for longer passwords
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate secure random password
   */
  static generateSecurePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one character from each category
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += allChars[crypto.randomInt(allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }
}

/**
 * Data encryption utilities
 */
class DataEncryption {
  /**
   * Encrypt sensitive data
   */
  static encrypt(text, key = process.env.DATABASE_ENCRYPTION_KEY) {
    try {
      const algorithm = ENCRYPTION.ALGORITHM;
      // Ensure key is 32 bytes for AES-256
      const keyBuffer = Buffer.from(key, 'hex').slice(0, 32);
      const iv = crypto.randomBytes(ENCRYPTION.IV_LENGTH);
      
      const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData, key = process.env.DATABASE_ENCRYPTION_KEY) {
    try {
      const algorithm = ENCRYPTION.ALGORITHM;
      // Ensure key is 32 bytes for AES-256
      const keyBuffer = Buffer.from(key, 'hex').slice(0, 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  /**
   * Generate encryption key
   */
  static generateEncryptionKey() {
    return crypto.randomBytes(ENCRYPTION.KEY_LENGTH).toString('hex');
  }

  /**
   * Hash data for comparison (one-way)
   */
  static hashData(data, salt = null) {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(data + actualSalt);
    
    return {
      hash: hash.digest('hex'),
      salt: actualSalt
    };
  }

  /**
   * Verify hashed data
   */
  static verifyHashedData(data, storedHash, salt) {
    const { hash } = this.hashData(data, salt);
    return hash === storedHash;
  }
}

/**
 * Token generation utilities
 */
class TokenGenerator {
  /**
   * Generate secure random token
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate URL-safe token
   */
  static generateURLSafeToken(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Generate numeric code
   */
  static generateNumericCode(length = 6) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return crypto.randomInt(min, max).toString();
  }

  /**
   * Generate verification token with expiry
   */
  static generateVerificationToken(expiryMinutes = 60) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + (expiryMinutes * 60 * 1000));
    
    return {
      token,
      expiresAt,
      isExpired: () => new Date() > expiresAt
    };
  }
}

/**
 * Secure comparison utilities
 */
class SecureComparison {
  /**
   * Timing-safe string comparison
   */
  static timingSafeEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    
    return crypto.timingSafeEqual(bufferA, bufferB);
  }

  /**
   * Constant-time string comparison
   */
  static constantTimeStringComparison(a, b) {
    let result = a.length ^ b.length;
    for (let i = 0; i < a.length && i < b.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

/**
 * Key derivation functions
 */
class KeyDerivation {
  /**
   * Derive key using PBKDF2
   */
  static deriveKey(password, salt, iterations = 100000, keyLength = 32) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString('hex'));
      });
    });
  }

  /**
   * Generate salt for key derivation
   */
  static generateSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }
}

module.exports = {
  PasswordSecurity,
  DataEncryption,
  TokenGenerator,
  SecureComparison,
  KeyDerivation
};