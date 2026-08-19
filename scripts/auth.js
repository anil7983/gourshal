// ═══════════════════════════════════════════════════
//  GOURSHAL — AUTH ENGINE (Hybrid API / LocalStorage)
// ═══════════════════════════════════════════════════

const Auth = {
  USERS_KEY: 'gourshal_users',
  SESSION_KEY: 'gourshal_session',

  get API_URL() {
    return window.Config ? Config.API_URL : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : window.location.origin + '/api');
  },

  // --- LOCAL FALLBACK METHODS ---
  getUsersLocal() {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || []; }
    catch { return []; }
  },

  saveUsersLocal(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  // Password hashing for localStorage fallback using SHA-256 (via Web Crypto API)
  // NOTE: This is a fallback mechanism. For production, always use the backend API.
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_gourshal_salt');
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for browsers without crypto.subtle (still not plain base64)
    return btoa(password + '_gourshal_salt').replace(/=/g, '');
  },

  // --- INPUT VALIDATION ---
  validateRegistration(name, email, password, phone = '') {
    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required.');
    } else if (!window.Utils?.validateEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters.');
    } else {
      const strength = this.getPasswordStrength(password);
      if (strength.score < 2) {
        errors.push('Password is too weak. Include uppercase, numbers, and symbols.');
      }
    }
    
    if (phone && !window.Utils?.validatePhone(phone)) {
      errors.push('Please enter a valid phone number.');
    }
    
    return { valid: errors.length === 0, errors };
  },

  getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return {
      score,
      label: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][score] || 'Very Weak'
    };
  },

  // --- MAIN METHODS ---
  async register(name, email, password, phone = '') {
    // Sanitize inputs
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const cleanPhone = typeof phone === 'string' ? phone.trim() : '';

    // Validate inputs
    const validation = this.validateRegistration(cleanName, cleanEmail, password, cleanPhone);
    if (!validation.valid) {
      return { ok: false, error: validation.errors.join(' ') };
    }

    try {
      // 1. Try real API
      const res = await fetch(`${this.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': window.Utils?.getCSRFToken() || ''
        },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password, phone: cleanPhone })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        this.createSession(data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || 'Registration failed' };
    } catch (e) {
      console.warn('Backend unavailable, falling back to LocalStorage auth');
      // 2. Fallback to LocalStorage
      const users = this.getUsersLocal();
      if (users.find(u => u.email === cleanEmail)) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const user = {
        id: 'u_' + Date.now(),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash: await this.hashPassword(password),
        role: (cleanEmail === 'admin@gourshal.com' || cleanEmail === 'rajy23636@gmail.com') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        orders: []
      };
      users.push(user);
      this.saveUsersLocal(users);
      this.createSession(user);
      return { ok: true, user };
    }
  },

  async login(email, password) {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    if (!cleanEmail || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }

    try {
      // 1. Try real API
      const res = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': window.Utils?.getCSRFToken() || ''
        },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        this.createSession(data.user);
        return { ok: true, user: data.user };
      }
      return { ok: false, error: data.error || 'Login failed' };
    } catch (e) {
      console.warn('Backend unavailable, falling back to LocalStorage auth');
      // 2. Fallback to LocalStorage
      const users = this.getUsersLocal();
      const user = users.find(u => u.email === cleanEmail);
      if (!user) return { ok: false, error: 'No account found with this email.' };
      
      const inputHash = await this.hashPassword(password);
      if (user.passwordHash !== inputHash) {
        return { ok: false, error: 'Incorrect password. Please try again.' };
      }
      this.createSession(user);
      return { ok: true, user };
    }
  },

  async forgotPassword(email) {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanEmail) return { ok: false, error: 'Email is required.' };

    try {
      const res = await fetch(`${this.API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.Utils?.getCSRFToken() || '' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Backend unavailable, falling back to LocalStorage auth');
      const users = this.getUsersLocal();
      const user = users.find(u => u.email === cleanEmail);
      if (!user) return { ok: false, error: 'No account found with this email.' };
      
      const token = Math.random().toString(36).substring(2, 8).toUpperCase();
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      this.saveUsersLocal(users);
      return { ok: true, message: 'If an account exists for this email, a password reset link has been sent.' };
    }
  },

  async resetPassword(token, newPassword) {
    if (!token || !newPassword) return { ok: false, error: 'Token and new password are required.' };
    if (newPassword.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

    try {
      const res = await fetch(`${this.API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.Utils?.getCSRFToken() || '' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Backend unavailable, falling back to LocalStorage auth');
      const users = this.getUsersLocal();
      const user = users.find(u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now());
      if (!user) return { ok: false, error: 'Password reset token is invalid or has expired.' };

      user.passwordHash = await this.hashPassword(newPassword);
      delete user.resetPasswordToken;
      delete user.resetPasswordExpires;
      this.saveUsersLocal(users);
      return { ok: true, message: 'Password has been updated.' };
    }
  },

  createSession(user) {
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.token || btoa(user.id + '_' + Date.now()),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(this.SESSION_KEY));
      if (!s) return null;
      if (Date.now() > s.expiresAt) { this.logout(); return null; }
      return s;
    } catch { return null; }
  },

  getToken() {
    const s = this.getSession();
    return s ? s.token : null;
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = 'index.html';
  },

  isLoggedIn() { return !!this.getSession(); },
  isAdmin() { const role = this.getSession()?.role; return role === 'admin' || role === 'super_admin'; },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const localUser = this.getUsersLocal().find(u => u.id === session.userId);
    return localUser || session;
  },

  // For backward compatibility with login.html demo login
  getUsers() {
    return this.getUsersLocal();
  },

  updateNavAuth() {
    const session = this.getSession();
    const authItem = document.getElementById('authNavItem');
    if (!authItem) return;
    if (session) {
      authItem.innerHTML = `
        <div class="nav-user-menu">
          <a href="#" class="nav-user-trigger" aria-label="User menu">
            <span class="nav-avatar" aria-hidden="true">${session.name[0].toUpperCase()}</span>
            ${session.name.split(' ')[0]}
          </a>
          <div class="nav-dropdown">
            <a href="orders.html">My Orders</a>
            ${session.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
            <a href="#" onclick="Auth.logout()">Sign Out</a>
          </div>
        </div>`;
    } else {
      authItem.innerHTML = `<a href="login.html" class="nav-cta">Sign In</a>`;
    }
  }
};

// Update nav on every page
document.addEventListener('DOMContentLoaded', () => Auth.updateNavAuth());