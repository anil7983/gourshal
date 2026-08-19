const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const sanitized = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeHtml(obj[key].trim());
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidPhone = (phone) => {
  if (!phone) return true;
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,14}$/;
  return re.test(phone);
};

const validate = (fields) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field of fields) {
      const { name, required, min, max, pattern, message } = field;
      const value = req.body?.[name];
      
      if (required && (value === undefined || value === null || value === '')) {
        errors.push(message || `${name} is required.`);
        continue;
      }
      
      if (value === undefined || value === null || value === '') continue;
      
      if (typeof value === 'string' && min !== undefined && value.length < min) {
        errors.push(message || `${name} must be at least ${min} characters.`);
      }
      
      if (typeof value === 'string' && max !== undefined && value.length > max) {
        errors.push(message || `${name} must be no more than ${max} characters.`);
      }
      
      if (name === 'email' && !isValidEmail(value)) {
        errors.push(message || 'Invalid email format.');
      }
      
      if (name === 'phone' && !isValidPhone(value)) {
        errors.push(message || 'Invalid phone number format.');
      }
      
      if (pattern && !pattern.test(value)) {
        errors.push(message || `Invalid ${name} format.`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ ok: false, error: errors.join(' ') });
    }
    
    next();
  };
};

module.exports = { sanitize, validate, isValidEmail, isValidPhone };
