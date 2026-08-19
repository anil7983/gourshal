// ═══════════════════════════════════════════════════
//  GOURSHAL — UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════

const Utils = {
  // Basic XSS prevention - escape HTML special characters
  sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Email validation
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Phone validation (Indian format)
  validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  },

  // Debounce function for input handlers
  debounce(fn, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  },

  // Format currency in INR
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format date for display
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  },

  // Sanitize input for API (remove potentially dangerous characters)
  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  },

  // Get CSRF token placeholder (to be implemented with backend)
  getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }
};

window.Utils = Utils;