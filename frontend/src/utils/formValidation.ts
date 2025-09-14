// Form validation utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | undefined => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return undefined;
  }

  // Min length validation
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return `${fieldName} format is invalid`;
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

export const validateForm = (
  data: Record<string, any>,
  validationRules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = data[fieldName];
    const rules = validationRules[fieldName];
    const error = validateField(value, rules, fieldName);
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Specific validation functions for agent upload form
export const validateAgentName = (name: string): string | undefined => {
  if (!name.trim()) {
    return 'Agent name is required';
  }
  if (name.trim().length < 3) {
    return 'Agent name must be at least 3 characters';
  }
  if (name.trim().length > 100) {
    return 'Agent name must be no more than 100 characters';
  }
  return undefined;
};

export const validateDescription = (description: string): string | undefined => {
  if (!description.trim()) {
    return 'Description is required';
  }
  if (description.trim().length < 10) {
    return 'Description must be at least 10 characters';
  }
  if (description.trim().length > 500) {
    return 'Description must be no more than 500 characters';
  }
  return undefined;
};

export const validateCategory = (category: string): string | undefined => {
  if (!category) {
    return 'Please select a category';
  }
  return undefined;
};

export const validateAuthorName = (authorName: string): string | undefined => {
  if (!authorName.trim()) {
    return 'Author name is required';
  }
  if (authorName.trim().length < 2) {
    return 'Author name must be at least 2 characters';
  }
  if (authorName.trim().length > 50) {
    return 'Author name must be no more than 50 characters';
  }
  return undefined;
};

export const validateFile = (file: File | null): string | undefined => {
  if (!file) {
    return 'Please select a file to upload';
  }
  
  // Check file type
  if (!file.name.endsWith('.zip')) {
    return 'Please select a .zip file';
  }
  
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return 'File size must be less than 50MB';
  }
  
  return undefined;
};

// Validation rules for agent upload form
export const agentUploadValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    custom: validateAgentName
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500,
    custom: validateDescription
  },
  category: {
    required: true,
    custom: validateCategory
  },
  author_name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: validateAuthorName
  }
};

// Email validation
export const validateEmail = (email: string): string | undefined => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }
  return undefined;
};

// URL validation
export const validateUrl = (url: string): string | undefined => {
  const urlPattern = /^https?:\/\/.+/;
  if (!url.trim()) {
    return 'URL is required';
  }
  if (!urlPattern.test(url)) {
    return 'Please enter a valid URL starting with http:// or https://';
  }
  return undefined;
};

// Number validation
export const validateNumber = (value: string, min?: number, max?: number): string | undefined => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (min !== undefined && num < min) {
    return `Value must be at least ${min}`;
  }
  if (max !== undefined && num > max) {
    return `Value must be no more than ${max}`;
  }
  return undefined;
};

// Phone number validation
export const validatePhoneNumber = (phone: string): string | undefined => {
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phone.trim()) {
    return 'Phone number is required';
  }
  if (!phonePattern.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return undefined;
};
