/**
 * Input validation and sanitization utilities
 */

export class ValidationService {
  private static instance: ValidationService;
  
  // Common regex patterns
  private readonly patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?1?\d{10,14}$/,
    ssn: /^\d{3}-?\d{2}-?\d{4}$/,
    clearanceLevel: /^(None|Confidential|Secret|Top Secret|TS\/SCI)$/i,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    name: /^[a-zA-Z\s'-]+$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    linkedinUrl: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
    fileExtension: /\.(pdf|doc|docx|txt|rtf)$/i,
    imageExtension: /\.(jpg|jpeg|png|gif|bmp|webp)$/i,
  };
  
  // XSS dangerous patterns
  private readonly xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
  ];
  
  private constructor() {}
  
  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }
  
  /**
   * Sanitizes input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!input) return '';
    
    let sanitized = input;
    
    // Remove dangerous patterns
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    return sanitized.trim();
  }
  
  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    return this.patterns.email.test(email);
  }
  
  /**
   * Validates phone number
   */
  isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 14;
  }
  
  /**
   * Validates SSN (with privacy considerations)
   */
  isValidSSN(ssn: string): boolean {
    const cleaned = ssn.replace(/\D/g, '');
    return cleaned.length === 9;
  }
  
  /**
   * Validates clearance level
   */
  isValidClearanceLevel(level: string): boolean {
    return this.patterns.clearanceLevel.test(level);
  }
  
  /**
   * Validates name (letters, spaces, hyphens, apostrophes)
   */
  isValidName(name: string): boolean {
    return this.patterns.name.test(name) && name.length >= 2 && name.length <= 50;
  }
  
  /**
   * Validates URL
   */
  isValidURL(url: string): boolean {
    return this.patterns.url.test(url);
  }
  
  /**
   * Validates LinkedIn URL
   */
  isValidLinkedInURL(url: string): boolean {
    return this.patterns.linkedinUrl.test(url);
  }
  
  /**
   * Validates password strength
   */
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Calculate strength
    let strengthScore = 0;
    if (password.length >= 8) strengthScore++;
    if (password.length >= 12) strengthScore++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strengthScore++;
    if (/[0-9]/.test(password)) strengthScore++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;
    
    if (strengthScore >= 5) strength = 'strong';
    else if (strengthScore >= 3) strength = 'medium';
    
    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }
  
  /**
   * Validates file upload
   */
  validateFileUpload(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): {
    isValid: boolean;
    error?: string;
  } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf']
    } = options;
    
    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
      };
    }
    
    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type'
      };
    }
    
    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      };
    }
    
    // Check for suspicious file names
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return {
        isValid: false,
        error: 'Invalid file name'
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Sanitizes file name
   */
  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-_]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }
  
  /**
   * Validates and sanitizes form data
   */
  validateFormData<T extends Record<string, any>>(
    data: T,
    rules: Record<keyof T, {
      required?: boolean;
      type?: 'string' | 'number' | 'email' | 'phone' | 'url' | 'clearance';
      min?: number;
      max?: number;
      pattern?: RegExp;
      custom?: (value: any) => boolean;
      sanitize?: boolean;
    }>
  ): {
    isValid: boolean;
    errors: Record<string, string>;
    sanitizedData: T;
  } {
    const errors: Record<string, string> = {};
    const sanitizedData = { ...data };
    
    for (const [field, rule] of Object.entries(rules) as [keyof T, any][]) {
      const value = data[field];
      
      // Check required
      if (rule.required && (!value || value === '')) {
        errors[String(field)] = `${String(field)} is required`;
        continue;
      }
      
      // Skip validation if not required and empty
      if (!value && !rule.required) continue;
      
      // Sanitize if requested
      if (rule.sanitize && typeof value === 'string') {
        sanitizedData[field] = this.sanitizeInput(value) as any;
      }
      
      // Type validation
      switch (rule.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors[String(field)] = 'Invalid email format';
          }
          break;
        case 'phone':
          if (!this.isValidPhone(value)) {
            errors[String(field)] = 'Invalid phone number';
          }
          break;
        case 'url':
          if (!this.isValidURL(value)) {
            errors[String(field)] = 'Invalid URL format';
          }
          break;
        case 'clearance':
          if (!this.isValidClearanceLevel(value)) {
            errors[String(field)] = 'Invalid clearance level';
          }
          break;
      }
      
      // Length validation
      if (typeof value === 'string') {
        if (rule.min && value.length < rule.min) {
          errors[String(field)] = `${String(field)} must be at least ${rule.min} characters`;
        }
        if (rule.max && value.length > rule.max) {
          errors[String(field)] = `${String(field)} must be no more than ${rule.max} characters`;
        }
      }
      
      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[String(field)] = `${String(field)} format is invalid`;
      }
      
      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors[String(field)] = `${String(field)} is invalid`;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }
}

export const validation = ValidationService.getInstance();