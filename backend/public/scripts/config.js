// ═══════════════════════════════════════════════════
//  GOURSHAL — CONFIGURATION
// ═══════════════════════════════════════════════════

const Config = {
  // API URL: Use window.location.origin for production, localhost:5000 for dev
  get API_URL() {
    // Check for meta tag override first
    const metaApi = document.querySelector('meta[name="api-url"]');
    if (metaApi) return metaApi.getAttribute('content');
    // Check for global config
    if (window.GOURSHAL_CONFIG?.apiUrl) return window.GOURSHAL_CONFIG.apiUrl;
    // Default based on environment
    if (window.location.protocol === 'file:' || !window.location.hostname || window.location.origin === 'null') {
      return 'https://gourshal.com/api';
    }
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://localhost:5000/api' : window.location.origin + '/api';
  },

  // Razorpay key from meta tag or window config (never hardcoded)
  get RAZORPAY_KEY() {
    const metaKey = document.querySelector('meta[name="razorpay-key"]');
    if (metaKey) return metaKey.getAttribute('content');
    return window.GOURSHAL_CONFIG?.razorpayKey || '';
  },

  // Detect if backend is available
  async isBackendAvailable() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.API_URL}/health`, { 
        signal: controller.signal,
        method: 'GET'
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }
};

window.Config = Config;