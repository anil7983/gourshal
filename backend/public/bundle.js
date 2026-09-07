// GOUSHAL PRODUCTION BUILD
// ─── auth.js ───
const Auth = {
USERS_KEY: 'gourshal_users',
SESSION_KEY: 'gourshal_session',
get API_URL() {
return window.Config ? Config.API_URL : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http:
},
getUsersLocal() {
try { return JSON.parse(localStorage.getItem(this.USERS_KEY)) || []; }
catch { return []; }
},
saveUsersLocal(users) {
localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
},
async hashPassword(password) {
const encoder = new TextEncoder();
const data = encoder.encode(password + '_gourshal_salt');
if (typeof crypto !== 'undefined' && crypto.subtle) {
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
return btoa(password + '_gourshal_salt').replace(/=/g, '');
},
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
async register(name, email, password, phone = '') {
const cleanName = typeof name === 'string' ? name.trim() : '';
const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
const validation = this.validateRegistration(cleanName, cleanEmail, password, cleanPhone);
if (!validation.valid) {
return { ok: false, error: validation.errors.join(' ') };
}
try {
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
role: 'user',
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
async demoLogin() {
try {
const res = await fetch(`${this.API_URL}/auth/demo-login`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'X-CSRF-Token': window.Utils?.getCSRFToken() || ''
}
});
const data = await res.json();
if (res.ok && data.ok) {
const demoUser = {
...data.user,
role: 'user',
id: data.user.id || 'u_demo_customer',
email: data.user.email || 'demo@gourshal.com'
};
this.createSession(demoUser);
return { ok: true, user: demoUser };
}
return { ok: false, error: data.error || 'Demo login failed' };
} catch (e) {
console.warn('Backend unavailable, falling back to LocalStorage demo auth');
const demoUser = {
id: 'u_demo_customer',
name: 'Demo Customer',
email: 'demo@gourshal.com',
role: 'user',
createdAt: new Date().toISOString(),
orders: []
};
this.createSession(demoUser);
return { ok: true, user: demoUser };
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
try {
const session = JSON.parse(localStorage.getItem(this.SESSION_KEY));
if (session && session.userId) {
localStorage.removeItem(`gourshal_cart_${session.userId}`);
}
} catch (e) {  }
localStorage.removeItem(this.SESSION_KEY);
window.location.href = 'index.html';
},
isLoggedIn() { return !!this.getSession(); },
isAdmin() {
const session = this.getSession();
if (!session) return false;
const role = session.role;
return role === 'admin' || role === 'super_admin';
},
getCurrentUser() {
const session = this.getSession();
if (!session) return null;
const localUser = this.getUsersLocal().find(u => u.id === session.userId);
return localUser || session;
},
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
document.addEventListener('DOMContentLoaded', () => Auth.updateNavAuth());

// ─── build.js ───
const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = projectRoot;
const backendDir = path.join(projectRoot, 'backend');
function ensureDir(dir) {
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function writeFile(filePath, content) {
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Created: ${filePath}`);
}
console.log('\n🌿 Gourshal Production Build v1.0\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📦 Step 1: Minifying CSS...');
const cssFiles = {
'main.css': fs.readFileSync(path.join(frontendDir, 'styles', 'main.css'), 'utf8'),
'home.css': fs.readFileSync(path.join(frontendDir, 'styles', 'home.css'), 'utf8'),
};
function minifyCss(css) {
return css
.replace(/\/\*[\s\S]*?\*\
.replace(/\s+/g, ' ')
.replace(/\s*([{}:;,>+~])\s*/g, '$1')
.replace(/;\}/g, '}')
.replace(/\s*!important/g, '!important')
.trim();
}
const buildDir = path.join(backendDir, 'public');
ensureDir(buildDir);
const cssBuildDir = path.join(buildDir, 'styles');
ensureDir(cssBuildDir);
let minifiedCss = '';
for (const [name, content] of Object.entries(cssFiles)) {
const minified = minifyCss(content);
writeFile(path.join(cssBuildDir, name), minified);
minifiedCss += minified;
}
console.log('📦 Step 2: Minifying and bundling JS...');
const jsFiles = fs.readdirSync(path.join(frontendDir, 'scripts')).filter(f => f.endsWith('.js'));
let bundledJs = '
for (const file of jsFiles) {
let content = fs.readFileSync(path.join(frontendDir, 'scripts', file), 'utf8');
content = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\
content = content.replace(/\n\s*\n/g, '\n').trim();
bundledJs += `
}
bundledJs = bundledJs.split('\n').map(line => line.trim()).filter((line, i, arr) => {
if (line === '' && arr[i + 1] === '') return false;
return true;
}).join('\n');
writeFile(path.join(buildDir, 'bundle.js'), bundledJs);
console.log('📦 Step 3: Copying static assets...');
function copyDirRecursive(src, dst) {
ensureDir(dst);
const entries = fs.readdirSync(src, { withFileTypes: true });
for (const entry of entries) {
const srcPath = path.join(src, entry.name);
const dstPath = path.join(dst, entry.name);
if (entry.isDirectory()) {
copyDirRecursive(srcPath, dstPath);
} else {
fs.copyFileSync(srcPath, dstPath);
console.log(`Copied asset: ${entry.name}`);
}
}
}
copyDirRecursive(path.join(frontendDir, 'public'), buildDir);
const scriptsBuildDir = path.join(buildDir, 'scripts');
ensureDir(scriptsBuildDir);
for (const file of jsFiles) {
fs.copyFileSync(path.join(frontendDir, 'scripts', file), path.join(scriptsBuildDir, file));
console.log(`Copied script: ${file}`);
}
console.log('📦 Step 4: Copying HTML pages...');
const htmlFiles = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
let html = fs.readFileSync(path.join(frontendDir, file), 'utf8');
const cacheVer = Date.now().toString(36);
html = html.replace(/<script src="(\/)?scripts\/([^"?]+)(\?[^"]*)?"><\/script>/g, (match, prefix, scriptFile) => {
return `<script src="/scripts/${scriptFile}?v=${cacheVer}"></script>`;
});
html = html.replace(/href="(\/)?styles\/([^"?]+)(\?[^"]*)?"/g, `href="/styles/$2?v=${cacheVer}"`);
html = html.replace(/(src|href)="(\/)?public\/([^"]+)"/g, '$1="/$3"');
html = html.replace(/openStoryVideo\('(\/)?(public\/)?([^']+)'/g, "openStoryVideo('/$3'");
html = html.replace(/switchModalChapter\('(\/)?(public\/)?([^']+)'/g, "switchModalChapter('/$3'");
html = html.replace(/poster="(\/)?(public\/)?([^"]+)"/g, 'poster="/$3"');
html = html.replace(/href="data:image\/svg\+xml,<svg[^"]*"/g, 'href="/favicon.svg"');
html = html.replace(/href="data:image\/svg\+xml,<svg[^>]*><\/svg>/g, 'href="/favicon.svg"');
writeFile(path.join(buildDir, file), html);
}
console.log('📦 Step 5: Generating production sitemap...');
const sitemap = fs.readFileSync(path.join(frontendDir, 'public', 'sitemap.xml'), 'utf8');
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Build Complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Output directory: ' + buildDir);
console.log('Files generated:');
console.log('  - bundle.js (combined JS)');
console.log('  - main.css (minified)');
console.log('  - home.css (minified)');
console.log('  - *.html (optimized HTML pages)');
console.log('  - Static assets copied');
console.log('\nNext steps:');
console.log('  1. Set environment variables in backend/.env');
console.log('  2. Run "npm start" from backend directory');
console.log('  3. Deploy backend to Render/Railway/Vercel');
console.log('  4. Deploy frontend to Netlify/Vercel/CDN');
console.log('  5. Update CORS_ORIGIN in .env\n');

// ─── cart.js ───
const Cart = {
BASE_STORAGE_KEY: 'gourshal_cart',
get STORAGE_KEY() {
try {
const session = JSON.parse(localStorage.getItem('gourshal_session'));
if (session && session.userId) {
return `gourshal_cart_${session.userId}`;
}
} catch (e) {  }
return 'gourshal_cart_guest';
},
get API_URL() {
return window.Config ? Config.API_URL : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http:
},
get() {
try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
catch { return []; }
},
save(items) {
localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
this.updateUI();
},
add(productId, qty = 1) {
const items = this.get();
const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
const product = productList.find(p => p && (p.id === productId || p.productId === productId || p._id === productId || String(p._id) === String(productId)));
if (!product) {
console.warn('Product not found in active list:', productId);
const existing = items.find(i => i.id === productId || i.productId === productId);
if (existing) {
existing.qty = (Number(existing.qty) || 1) + (Number(qty) || 1);
} else {
items.push({
id: productId,
productId: productId,
qty: Number(qty) || 1,
name: 'Gourshal Vedic Creation',
price: 899,
stock: 50,
unit: '500ml',
image: '/ghee.jpg',
category: 'Pure Vedic'
});
}
this.save(items);
this.showToast('Item added to cart');
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
return;
}
const safeStock = typeof product.stock === 'number' ? product.stock : 50;
if (safeStock <= 0) {
this.showToast(`${product.name} is currently out of stock`);
return;
}
const pId = product.id || product.productId || productId;
const existing = items.find(i => i.id === pId || i.productId === pId || i.id === productId);
if (existing) {
const newQty = Math.min((Number(existing.qty) || 1) + (Number(qty) || 1), safeStock);
existing.qty = newQty;
existing.price = Number(product.price) || existing.price || 899;
existing.name = product.name || existing.name;
existing.image = product.image || existing.image || '/ghee.jpg';
if (newQty >= safeStock) {
this.showToast(`Maximum available stock reached for ${product.name}`);
}
} else {
const safeQty = Math.min(Number(qty) || 1, safeStock);
items.push({
id: pId,
productId: product.productId || pId,
qty: safeQty,
name: product.name,
price: Number(product.price) || 899,
stock: safeStock,
unit: product.unit || '500ml',
image: product.image || '/ghee.jpg',
category: product.category || 'Pure Vedic'
});
}
this.save(items);
this.showToast(`Added to cart: ${product.name}`);
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
}
},
remove(productId) {
const items = this.get().filter(i => i.id !== productId && i.productId !== productId && i._id !== productId);
this.save(items);
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
}
},
updateQty(productId, qty) {
const items = this.get();
const item = items.find(i => i.id === productId || i.productId === productId || i._id === productId);
if (!item) return;
const parsedQty = Number(qty);
if (parsedQty <= 0) {
this.remove(productId);
return;
}
const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
const product = productList.find(p => p && (p.id === productId || p.productId === productId));
const maxStock = product?.stock || item.stock || 50;
if (parsedQty > maxStock) {
item.qty = maxStock;
this.showToast(`Limited to ${maxStock} units in stock`);
} else {
item.qty = parsedQty;
}
this.save(items);
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
}
},
clear() {
localStorage.removeItem(this.STORAGE_KEY);
this.updateUI();
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [], count: 0 } }));
}
},
count() {
return this.get().reduce((s, i) => s + (Number(i.qty) || 0), 0);
},
getItemQty(productId) {
const items = this.get();
const item = items.find(i => i && (i.id === productId || i.productId === productId || i._id === productId || String(i._id) === String(productId)));
return item ? (Number(item.qty) || 0) : 0;
},
total() {
const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
return this.get().reduce((s, i) => {
const p = productList.find(pr => pr && (pr.id === i.id || pr.productId === i.id || pr._id === i.id));
const price = p ? (Number(p.price) || 0) : (Number(i.price) || 0);
return s + price * (Number(i.qty) || 1);
}, 0);
},
getItems() {
const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
return this.get().map(item => {
const product = productList.find(p => p && (p.id === item.id || p.productId === item.id || p._id === item.id || String(p._id) === String(item.id)));
if (!product) {
return {
...item,
product: {
id: item.id || item.productId,
productId: item.productId || item.id,
name: item.name || 'Gourshal Vedic Creation',
price: Number(item.price) || 899,
stock: Number(item.stock) || 50,
unit: item.unit || '500ml',
image: item.image || '/ghee.jpg',
category: item.category || 'Pure Vedic'
}
};
}
return {
...item,
product: {
...product,
image: product.image || item.image || '/ghee.jpg'
}
};
});
},
updateUI() {
const count = this.count();
const navCounts = document.querySelectorAll('#navCartCount, .nav-cart-count, #cartCount, .cart-count, #homeCartCount');
navCounts.forEach(el => {
if (el) el.textContent = count;
});
const pill = document.getElementById('cartPill');
if (pill) {
pill.classList.toggle('visible', count > 0);
const pillCount = pill.querySelector('#cartCount, span');
if (pillCount) pillCount.textContent = count;
}
},
showToast(msg) {
try {
let toast = document.getElementById('cartToast');
if (!toast) {
toast = document.createElement('div');
toast.id = 'cartToast';
toast.className = 'cart-toast';
toast.setAttribute('role', 'alert');
toast.setAttribute('aria-live', 'polite');
if (document.body) document.body.appendChild(toast);
}
const text = document.getElementById('toastText') || (toast && typeof toast.querySelector === 'function' ? toast.querySelector('.toast-text, span') : null);
if (text) {
text.textContent = msg;
} else if (toast) {
toast.innerHTML = `<div class="toast-icon">✓</div><div class="toast-text" id="toastText">${msg}</div>`;
}
if (toast && toast.classList) toast.classList.add('show');
clearTimeout(this._toastTimer);
this._toastTimer = setTimeout(() => {
if (toast && toast.classList) toast.classList.remove('show');
}, 3200);
} catch (e) {
console.warn('Toast notification skipped:', e);
}
}
};
document.addEventListener('DOMContentLoaded', () => Cart.updateUI());
window.Cart = Cart;

// ─── config.js ───
const Config = {
get API_URL() {
const metaApi = document.querySelector('meta[name="api-url"]');
if (metaApi) return metaApi.getAttribute('content');
if (window.GOURSHAL_CONFIG?.apiUrl) return window.GOURSHAL_CONFIG.apiUrl;
if (window.location.protocol === 'file:' || !window.location.hostname || window.location.origin === 'null') {
return 'https:
}
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
return isLocalhost ? 'http:
},
get RAZORPAY_KEY() {
const metaKey = document.querySelector('meta[name="razorpay-key"]');
if (metaKey) return metaKey.getAttribute('content');
return window.GOURSHAL_CONFIG?.razorpayKey || '';
},
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

// ─── effects.js ───
const Effects = {
initParticles(canvas, particleCount = 60) {
if (!canvas) return null;
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
for (let i = 0; i < particleCount; i++) {
particles.push({
x: Math.random() * window.innerWidth,
y: Math.random() * window.innerHeight,
vx: (Math.random() - 0.5) * 0.25,
vy: (Math.random() - 0.5) * 0.25,
size: Math.random() * 1.5 + 0.3,
opacity: Math.random() * 0.5 + 0.1,
gold: Math.random() > 0.45
});
}
function animate() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
particles.forEach(p => {
p.x += p.vx;
p.y += p.vy;
if (p.x < 0) p.x = canvas.width;
if (p.x > canvas.width) p.x = 0;
if (p.y < 0) p.y = canvas.height;
if (p.y > canvas.height) p.y = 0;
ctx.beginPath();
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctx.fillStyle = p.gold
? `rgba(201,168,76,${p.opacity})`
: `rgba(184,184,200,${p.opacity * 0.5})`;
ctx.fill();
});
requestAnimationFrame(animate);
}
animate();
return { canvas, particles };
},
initCursorGlow(glowElement) {
if (!glowElement) return;
function onMouseMove(e) {
glowElement.style.left = e.clientX + 'px';
glowElement.style.top = e.clientY + 'px';
}
document.addEventListener('mousemove', onMouseMove);
return () => document.removeEventListener('mousemove', onMouseMove);
}
};
window.Effects = Effects;
document.addEventListener('DOMContentLoaded', () => {
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks && !hamburger.dataset.bound) {
hamburger.dataset.bound = "true";
hamburger.addEventListener('click', (e) => {
e.stopPropagation();
hamburger.classList.toggle('open');
navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
link.addEventListener('click', () => {
hamburger.classList.remove('open');
navLinks.classList.remove('open');
});
});
}
});

// ─── home.js ───
document.addEventListener('DOMContentLoaded', () => {
initHeroSwitcher();
initHomeProductsGrid();
initCategoryFilters();
initNavbarAndCart();
initCursorGlow();
initTestimonialSlider();
});
let activeHeroIndex = 0;
let heroAutoTimer = null;
function initHeroSwitcher() {
const switcher = document.getElementById('heroSwitcher');
if (!switcher || typeof GOURSHAL_HERO_PRODUCTS === 'undefined') return;
switcher.style.display = 'none';
switcher.innerHTML = GOURSHAL_HERO_PRODUCTS.map((prod, index) => `
<button class="hero-tab-btn ${index === 0 ? 'active' : ''}"
role="tab"
aria-selected="${index === 0 ? 'true' : 'false'}"
onclick="switchHeroProduct(${index})">
<img src="${prod.thumbImage || prod.image}" alt="${prod.tabName}" class="tab-product-thumb" loading="lazy">
<span class="tab-label-text">${prod.tabName}</span>
</button>
`).join('');
renderHeroProduct(GOURSHAL_HERO_PRODUCTS[0]);
startHeroAutoRotation();
const heroSection = document.getElementById('hero');
if (heroSection) {
heroSection.addEventListener('mouseenter', () => stopHeroAutoRotation());
heroSection.addEventListener('mouseleave', () => startHeroAutoRotation());
}
}
function startHeroAutoRotation() {
stopHeroAutoRotation();
heroAutoTimer = setInterval(() => {
activeHeroIndex = (activeHeroIndex + 1) % GOURSHAL_HERO_PRODUCTS.length;
switchHeroProduct(activeHeroIndex, false);
}, 5000);
}
function stopHeroAutoRotation() {
if (heroAutoTimer) {
clearInterval(heroAutoTimer);
heroAutoTimer = null;
}
}
function switchHeroProduct(index, userTriggered = true) {
if (userTriggered) stopHeroAutoRotation();
activeHeroIndex = index;
const tabs = document.querySelectorAll('.hero-tab-btn');
tabs.forEach((tab, i) => {
tab.classList.toggle('active', i === index);
tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
});
const product = GOURSHAL_HERO_PRODUCTS[index];
renderHeroProduct(product);
}
function renderHeroProduct(prod) {
if (!prod) return;
const eyebrowEl = document.getElementById('heroEyebrow');
const titleEl = document.getElementById('heroTitle');
const subEl = document.getElementById('heroSub');
const badgesEl = document.getElementById('heroBadges');
const imgEl = document.getElementById('heroImg');
const glowEl = document.getElementById('heroGlow');
const shopBtn = document.getElementById('heroShopBtn');
const benefitBar = document.getElementById('heroBenefitBar');
if (titleEl) titleEl.style.opacity = '0';
if (imgEl) imgEl.style.opacity = '0';
setTimeout(() => {
if (eyebrowEl) {
eyebrowEl.innerHTML = `
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
<span>${prod.eyebrow}</span>
`;
}
if (titleEl) {
titleEl.innerHTML = prod.title;
titleEl.style.opacity = '1';
}
if (subEl) {
subEl.innerHTML = prod.subtitle;
}
if (badgesEl) {
badgesEl.innerHTML = prod.badges.map(b => `
<div class="hero-badge-item">
<div class="hero-badge-circle">${b.icon}</div>
<span class="hero-badge-label">${b.label}</span>
</div>
`).join('');
}
if (shopBtn) {
shopBtn.href = `product.html?id=${prod.productId}`;
}
if (imgEl) {
imgEl.src = prod.image;
imgEl.alt = prod.tabName;
imgEl.style.opacity = '1';
}
if (glowEl) {
glowEl.style.background = `radial-gradient(circle, ${prod.glowColor} 0%, transparent 70%)`;
}
if (benefitBar) {
benefitBar.innerHTML = prod.benefits.map(b => `
<div class="benefit-item">
<div class="benefit-icon-wrap">${b.icon}</div>
<div class="benefit-text-wrap">
<div class="benefit-title">${b.title}</div>
<div class="benefit-desc">${b.desc}</div>
</div>
</div>
`).join('');
}
}, 180);
}
let currentFilter = 'all';
function initHomeProductsGrid() {
renderMasterpiecesGrid();
window.addEventListener('productsLoaded', renderMasterpiecesGrid);
}
function renderMasterpiecesGrid() {
const grid = document.getElementById('homeProductsGrid');
if (!grid || typeof GOURSHAL_PRODUCTS === 'undefined') return;
let products = GOURSHAL_PRODUCTS;
if (currentFilter !== 'all') {
products = products.filter(p => p.categorySlug === currentFilter);
}
if (products.length === 0) {
grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--muted-ink);">No products found in this category.</div>`;
return;
}
grid.innerHTML = products.map(p => {
const stockStatus = window.getStockStatus ? getStockStatus(p.stock) : { class: 'in-stock', label: 'In Stock' };
const formattedPrice = window.Utils?.formatCurrency ? Utils.formatCurrency(p.price) : '₹' + p.price;
const formattedOriginal = window.Utils?.formatCurrency ? Utils.formatCurrency(p.originalPrice) : '₹' + p.originalPrice;
const pid = p.productId || p.id || p._id;
const cartQty = window.Cart ? Cart.getItemQty(pid) : 0;
return `
<div class="modern-product-card" onclick="window.location='product.html?id=${pid}'">
${p.badge ? `<div class="card-badge">${p.badge}</div>` : ''}
<div class="card-img-wrap">
<img src="${p.image}" alt="${p.name}" loading="lazy">
</div>
<div class="card-meta-row">
<span class="card-category">${p.category}</span>
<span class="card-rating">★ ${p.rating || '4.9'} (${p.reviews || '450'})</span>
</div>
<h3 class="card-title">${p.name}</h3>
<p class="card-desc">${p.description}</p>
<div class="card-bottom-row">
<div class="card-price-block">
<span class="price-current">${formattedPrice} <small style="font-size:11px;font-weight:400;color:var(--muted-ink);">/ ${p.unit}</small></span>
<span class="price-original">${formattedOriginal}</span>
</div>
${cartQty > 0 ? `
<div class="card-stepper" onclick="event.stopPropagation();" role="group" aria-label="Adjust quantity">
<button class="stepper-btn" onclick="Cart.updateQty('${pid}', ${cartQty - 1}); renderMasterpiecesGrid();" aria-label="Decrease quantity">−</button>
<span class="stepper-count" aria-live="polite">${cartQty}</span>
<button class="stepper-btn" onclick="Cart.add('${pid}', 1); renderMasterpiecesGrid();" aria-label="Increase quantity">+</button>
</div>
` : `
<button class="btn-card-add" onclick="event.stopPropagation(); quickAddToCart('${pid}', '${(p.name || '').replace(/'/g, "\\'")}'); renderMasterpiecesGrid();" aria-label="Add ${p.name} to cart">
<span>Add</span>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
</button>
`}
</div>
</div>
`;
}).join('');
}
window.addEventListener('cartUpdated', () => {
if (typeof renderMasterpiecesGrid === 'function') renderMasterpiecesGrid();
});
function initCategoryFilters() {
const filterBtns = document.querySelectorAll('#productFilterBar .filter-pill');
filterBtns.forEach(btn => {
btn.addEventListener('click', () => {
filterBtns.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
currentFilter = btn.getAttribute('data-category');
renderMasterpiecesGrid();
});
});
}
function filterHomeCategory(categorySlug) {
const filterBtns = document.querySelectorAll('#productFilterBar .filter-pill');
filterBtns.forEach(btn => {
if (btn.getAttribute('data-category') === categorySlug) {
btn.classList.add('active');
} else {
btn.classList.remove('active');
}
});
currentFilter = categorySlug;
renderMasterpiecesGrid();
}
function quickAddToCart(productId, productName) {
if (window.Cart && typeof Cart.add === 'function') {
Cart.add(productId, 1);
} else {
console.warn('Cart engine not available');
}
}
const BATCH_REPORTS = {
'FL/07/026/F011': {
productName: 'GOURSHAL Pure Black Mustard Oil (Kachi Ghani)',
purity: '99.72% Pure (0.18% Moisture)',
adulteration: '0.0% (Zero Argemone & Mineral Oil)',
keyNutrient: '0.39% Allyl Isothiocyanate',
nutrientLabel: 'Natural Pungency (FSSR Standard: ≥0.20%)',
labInfo: 'FAST LABS (NABL & FSSAI Accredited / ISO/IEC 17025:2017)',
ulr: 'ISOTC-F2026000000528',
extraStats: '64.53% MUFA · 0.00g Cholesterol & Trans Fat · Peroxide: <0.2 meq/kg'
},
'GRL-2026-MUSTARD-OIL': {
productName: 'GOURSHAL Pure Black Mustard Oil (Kachi Ghani)',
purity: '99.72% Pure (0.18% Moisture)',
adulteration: '0.0% (Zero Argemone & Mineral Oil)',
keyNutrient: '64.53% MUFA / 0.39% AITC',
nutrientLabel: 'Heart-Healthy Fatty Acids & Natural Pungency',
labInfo: 'FAST LABS (Report #FL/07/026/F011 · NABL Accredited)',
ulr: 'ISOTC-F2026000000528',
extraStats: '0.00g Cholesterol · 0.00g Trans Fats · Energy: 892.2 Kcal/100g'
},
'GRL-2026-GHEE-A2': {
productName: 'A2 Vedic Bilona Pure Cow Ghee',
purity: '99.9% Pure Ghee',
adulteration: '0.0% (Zero Vanaspati/Palm Oil)',
keyNutrient: '8.4g CLA / 100g',
nutrientLabel: 'Active Conjugated Linoleic Acid',
labInfo: 'Certified NABL / FSSAI Lab Tested',
ulr: 'GRL-NABL-2026-GHEE'
},
'GRL-2026-TURMERIC-85': {
productName: 'Meghalaya Lakadong Turmeric Root',
purity: '99.8% Pure',
adulteration: '0.0% (Zero Lead Chromate / Starch)',
keyNutrient: '8.65% Curcumin',
nutrientLabel: 'Natural Active Curcuminoids',
labInfo: 'Certified NABL / FSSAI Lab Tested',
ulr: 'GRL-NABL-2026-TURM'
},
'GRL-2026-HONEY-RAW': {
productName: 'Raw Multi-Floral Jungle Honey',
purity: '100% Raw Unheated',
adulteration: '0.0% (Zero C4 Sugars / Corn Syrup)',
keyNutrient: '18.2 Diastase Activity',
nutrientLabel: 'Live Natural Bio-Enzymes',
labInfo: 'Certified NABL / FSSAI Lab Tested',
ulr: 'GRL-NABL-2026-HNY'
}
};
function verifyDemoBatch(code) {
const input = document.getElementById('batchCodeInput');
if (input) {
input.value = code;
verifyBatchCode();
}
}
function verifyBatchCode() {
const input = document.getElementById('batchCodeInput');
const display = document.getElementById('labResultDisplay');
if (!input || !display) return;
const code = input.value.trim().toUpperCase();
const report = BATCH_REPORTS[code] || {
productName: 'Authentic Certified Gourshal Product',
purity: '99.8%',
adulteration: '0.0%',
keyNutrient: 'Certified NABL Compliant',
nutrientLabel: 'FSSAI Pure Batch Standards'
};
document.getElementById('labProductName').innerText = report.productName;
document.getElementById('labBatchId').innerText = code || 'GRL-SAMPLE';
document.getElementById('labPurityScore').innerText = report.purity;
document.getElementById('labAdulteration').innerText = report.adulteration;
document.getElementById('labKeyNutrient').innerText = report.keyNutrient;
document.getElementById('labNutrientLabel').innerText = report.nutrientLabel;
const labEl = document.getElementById('labTestedBy');
if (labEl) labEl.innerText = report.labInfo || 'Certified NABL Accredited Lab';
display.classList.add('active');
}
function initNavbarAndCart() {
const navbar = document.getElementById('navbar');
if (navbar) {
window.addEventListener('scroll', () => {
navbar.classList.toggle('scrolled', window.scrollY > 40);
});
}
const hamburger = document.getElementById('navHamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
hamburger.addEventListener('click', () => {
navLinks.classList.toggle('open');
hamburger.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
link.addEventListener('click', () => {
navLinks.classList.remove('open');
hamburger.classList.remove('open');
});
});
}
updateCartCounters();
window.addEventListener('cartUpdated', updateCartCounters);
}
function updateCartCounters() {
let count = 0;
try {
if (window.Cart && typeof window.Cart.count === 'function') {
count = window.Cart.count();
} else {
const session = JSON.parse(localStorage.getItem('gourshal_session') || 'null');
const storageKey = session && session.userId ? `gourshal_cart_${session.userId}` : 'gourshal_cart_guest';
const raw = localStorage.getItem(storageKey);
if (raw) {
const items = JSON.parse(raw);
count = items.reduce((sum, item) => sum + (item.qty || 1), 0);
}
}
} catch (e) {}
const navCount = document.getElementById('navCartCount');
const pillCount = document.getElementById('cartCount');
const cartPill = document.getElementById('cartPill');
if (navCount) navCount.innerText = count;
if (pillCount) pillCount.innerText = count;
if (cartPill) {
cartPill.classList.toggle('visible', count > 0);
}
}
function initCursorGlow() {
const glow = document.getElementById('cursorGlow');
if (!glow) return;
document.addEventListener('mousemove', e => {
glow.style.left = e.clientX + 'px';
glow.style.top = e.clientY + 'px';
});
}
function openStoryVideo(videoSrc, title, tag) {
const modal = document.getElementById('storyVideoModal');
const videoEl = document.getElementById('modalVideoElement');
const titleEl = document.getElementById('modalVideoTitle');
const tagEl = document.getElementById('modalVideoTag');
if (!modal) return;
if (titleEl) titleEl.innerText = title || 'GOURSHAL Brand Documentary';
if (tagEl) tagEl.innerText = tag || 'Craft Film';
modal.classList.add('active');
modal.style.display = 'flex';
modal.style.opacity = '1';
modal.style.visibility = 'visible';
modal.style.pointerEvents = 'auto';
document.body.style.overflow = 'hidden';
if (videoEl) {
let src = videoSrc || '/videos/farm-nature.webm';
let resolvedSrc = src;
if (window.location.protocol === 'file:') {
resolvedSrc = src.replace(/^\/+/, '');
} else {
if (src.startsWith('/')) {
resolvedSrc = src;
} else {
resolvedSrc = '/' + src.replace(/^public\
}
}
const sourceEl = videoEl.querySelector('source') || document.getElementById('modalVideoSource');
if (sourceEl) {
sourceEl.src = resolvedSrc;
sourceEl.type = resolvedSrc.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
}
videoEl.src = resolvedSrc;
videoEl.controls = true;
videoEl.currentTime = 0;
videoEl.muted = false;
const tryPlay = () => {
const playPromise = videoEl.play();
if (playPromise !== undefined) {
playPromise.catch(err => {
console.warn('Playback with audio blocked by browser autoplay policy, falling back to muted:', err);
videoEl.muted = true;
videoEl.play().catch(() => {});
});
}
};
videoEl.addEventListener('loadeddata', tryPlay, { once: true });
videoEl.addEventListener('canplay', tryPlay, { once: true });
try {
videoEl.load();
tryPlay();
} catch (e) {
tryPlay();
}
}
const chapterBtns = document.querySelectorAll('.video-chapter-btn');
let matched = false;
chapterBtns.forEach(btn => {
btn.classList.remove('active');
const attr = btn.getAttribute('onclick') || '';
if (!matched && tag && attr.includes(tag)) {
btn.classList.add('active');
matched = true;
}
});
if (!matched && chapterBtns.length > 0) {
chapterBtns[0].classList.add('active');
}
}
function closeStoryVideo() {
const modal = document.getElementById('storyVideoModal');
const videoEl = document.getElementById('modalVideoElement');
if (modal) {
modal.classList.remove('active');
modal.style.display = 'none';
modal.style.opacity = '0';
modal.style.visibility = 'hidden';
modal.style.pointerEvents = 'none';
}
document.body.style.overflow = '';
if (videoEl) {
try {
videoEl.pause();
videoEl.currentTime = 0;
} catch (e) {}
}
}
function switchModalChapter(videoSrc, title, tag, btn) {
const videoEl = document.getElementById('modalVideoElement');
const titleEl = document.getElementById('modalVideoTitle');
const tagEl = document.getElementById('modalVideoTag');
if (titleEl) titleEl.innerText = title;
if (tagEl) tagEl.innerText = tag;
document.querySelectorAll('.video-chapter-btn').forEach(b => b.classList.remove('active'));
if (btn) btn.classList.add('active');
if (videoEl) {
let src = videoSrc;
let resolvedSrc = src;
if (window.location.protocol === 'file:') {
resolvedSrc = src.replace(/^\/+/, '');
} else {
if (src.startsWith('/')) {
resolvedSrc = src;
} else {
resolvedSrc = '/' + src.replace(/^public\
}
}
const sourceEl = videoEl.querySelector('source') || document.getElementById('modalVideoSource');
if (sourceEl) {
sourceEl.src = resolvedSrc;
sourceEl.type = resolvedSrc.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
}
videoEl.src = resolvedSrc;
videoEl.currentTime = 0;
videoEl.muted = false;
const tryPlay = () => {
const playPromise = videoEl.play();
if (playPromise !== undefined) {
playPromise.catch(() => {
videoEl.muted = true;
videoEl.play().catch(() => {});
});
}
};
videoEl.addEventListener('loadeddata', tryPlay, { once: true });
videoEl.addEventListener('canplay', tryPlay, { once: true });
try {
videoEl.load();
tryPlay();
} catch (e) {
tryPlay();
}
}
const chapterBtns = document.querySelectorAll('.video-chapter-btn');
chapterBtns.forEach(b => b.classList.remove('active'));
if (btn) btn.classList.add('active');
}
let testiAutoTimer = null;
function initTestimonialSlider() {
const slider = document.getElementById('testiSlider');
const dotsContainer = document.getElementById('testiDots');
if (!slider) return;
const cards = slider.querySelectorAll('.testi-card');
if (!cards.length) return;
const updateDotsCount = () => {
if (!dotsContainer) return;
const cardWidth = cards[0].offsetWidth + 28;
const maxScroll = slider.scrollWidth - slider.clientWidth;
const totalSteps = Math.max(1, Math.ceil(maxScroll / cardWidth) + 1);
dotsContainer.innerHTML = Array.from({ length: totalSteps }).map((_, idx) => `
<button class="testi-dot ${idx === 0 ? 'active' : ''}" onclick="goToTestimonial(${idx})" aria-label="Go to slide ${idx + 1}"></button>
`).join('');
};
updateDotsCount();
window.addEventListener('resize', updateDotsCount);
slider.addEventListener('scroll', () => {
const cardWidth = cards[0].offsetWidth + 28;
const maxScroll = slider.scrollWidth - slider.clientWidth;
if (maxScroll <= 0) return;
if (slider.scrollLeft >= maxScroll - 15) {
const dots = document.querySelectorAll('.testi-dot');
if (dots.length) updateTestiDots(dots.length - 1);
} else {
const activeIndex = Math.round(slider.scrollLeft / cardWidth);
updateTestiDots(activeIndex);
}
}, { passive: true });
const startTestiAuto = () => {
stopTestiAuto();
testiAutoTimer = setInterval(() => moveTestimonials(1), 4000);
};
const stopTestiAuto = () => {
if (testiAutoTimer) { clearInterval(testiAutoTimer); testiAutoTimer = null; }
};
const section = document.getElementById('testimonials');
if (section) {
section.addEventListener('mouseenter', stopTestiAuto);
section.addEventListener('mouseleave', startTestiAuto);
section.addEventListener('touchstart', stopTestiAuto, { passive: true });
section.addEventListener('touchend', () => setTimeout(startTestiAuto, 2000), { passive: true });
}
startTestiAuto();
}
function moveTestimonials(direction) {
const slider = document.getElementById('testiSlider');
if (!slider) return;
const cards = slider.querySelectorAll('.testi-card');
if (!cards.length) return;
const cardWidth = cards[0].offsetWidth + 28;
const maxScroll = slider.scrollWidth - slider.clientWidth;
if (direction === 1 && slider.scrollLeft >= maxScroll - 15) {
slider.scrollTo({ left: 0, behavior: 'smooth' });
} else if (direction === -1 && slider.scrollLeft <= 15) {
slider.scrollTo({ left: maxScroll, behavior: 'smooth' });
} else {
slider.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}
}
function goToTestimonial(index) {
const slider = document.getElementById('testiSlider');
if (!slider) return;
const cards = slider.querySelectorAll('.testi-card');
if (!cards.length) return;
const cardWidth = cards[0].offsetWidth + 28;
const targetLeft = index * cardWidth;
slider.scrollTo({ left: targetLeft, behavior: 'smooth' });
updateTestiDots(index);
}
function updateTestiDots(activeIndex) {
const dots = document.querySelectorAll('.testi-dot');
dots.forEach((dot, idx) => {
dot.classList.toggle('active', idx === activeIndex);
});
}
window.quickAddToCart = quickAddToCart;
window.switchHeroProduct = switchHeroProduct;
window.filterHomeCategory = filterHomeCategory;
window.openStoryVideo = openStoryVideo;
window.closeStoryVideo = closeStoryVideo;
window.switchModalChapter = switchModalChapter;
window.moveTestimonials = moveTestimonials;
window.goToTestimonial = goToTestimonial;
window.verifyDemoBatch = verifyDemoBatch;
window.verifyBatchCode = verifyBatchCode;
document.addEventListener('keydown', e => {
if (e.key === 'Escape') closeStoryVideo();
});
document.addEventListener('click', e => {
const modal = document.getElementById('storyVideoModal');
if (modal && e.target === modal) closeStoryVideo();
});

// ─── products.js ───
const GOURSHAL_HERO_PRODUCTS = [
{
key: 'ghee',
tabName: 'A2 Cow Ghee',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2v5m-4-2.5h8"/><path d="M6 9h12l-2 11H8L6 9z"/><circle cx="12" cy="14" r="2"/></svg>`,
eyebrow: 'PURE • NATURAL • TIMELESS',
title: 'PURE GHEE,<br>CRAFTED TO LAST',
subtitle: 'Made from A2 cow milk using the traditional Bilona method for rich aroma, granular texture, and unmatched nutritional purity.',
productId: 'ghee-500',
price: 899,
originalPrice: 1099,
unit: '500ml',
image: '/ghee-hero.jpg',
thumbImage: '/ghee.jpg',
glowColor: 'rgba(212,168,75,0.4)',
accentBg: '#F7F3EB',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 16c1-2 2-4 4-5 1-1 3-1 4 0 2 1 3 3 4 5"/><circle cx="8" cy="8" r="3"/><path d="M16 11c1-1 2-1 3 0 1 1 2 3 3 5"/><circle cx="17" cy="6" r="2"/><line x1="6" y1="18" x2="6" y2="21"/><line x1="10" y1="18" x2="10" y2="21"/><line x1="14" y1="18" x2="14" y2="21"/><line x1="18" y1="18" x2="18" y2="21"/></svg>`,
label: 'A2 Cow Milk'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v6m-4-3h8"/><path d="M6 10h12l-2 10H8L6 10z"/><circle cx="12" cy="14" r="2"/></svg>`,
label: 'Bilona Method'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
label: '100% Natural'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 2v7.31M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>`,
label: 'No Preservatives'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
title: 'Rich in Nutrients',
desc: 'Packed with essential vitamins A, D, E, K & healthy Omega fats'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
title: 'Boosts Immunity',
desc: 'Strengthens immunity and overall metabolic well-being'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z"/><path d="M12 8v4l3 3"/></svg>`,
title: 'Aids Digestion',
desc: 'Natural butyric acid supports gut lining & gentle digestion'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
title: 'Good for Heart',
desc: 'Contains healthy CLA & essential fats that support heart health'
}
]
},
{
key: 'mustard-oil',
tabName: 'Mustard Oil',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 9v4"/></svg>`,
eyebrow: 'COLD-PRESSED • RAW • AUTHENTIC',
title: 'KACHI GHANI OIL,<br>COLD-PRESSED TO PURITY',
subtitle: 'Extracted slowly using traditional cold-pressing below 35°C. Retains natural pungent aroma, vital antioxidants, and pure golden clarity.',
productId: 'mustard-oil-500',
price: 349,
originalPrice: 449,
unit: '500ml',
image: '/mustard-hero.jpg',
thumbImage: '/products/mustard-oil.jpg',
glowColor: 'rgba(218,165,32,0.45)',
accentBg: '#FAF5E8',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 9v4"/></svg>`,
label: 'Cold-Pressed'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
label: 'Cold (<35°C)'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
label: '100% Unrefined'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
label: 'Rich Pungency'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
title: 'Heart Healthy MUFA',
desc: 'Optimal 1:1 Omega 3 & 6 balance supporting cardiovascular fitness'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
title: 'Natural Antimicrobial',
desc: 'High Allyl Isothiocyanate naturally wards off bacteria & infections'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
title: 'Nourishes Hair & Skin',
desc: 'Deeply conditions hair roots and stimulates micro-blood circulation'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
title: 'Ignites Digestion',
desc: 'Stimulates digestive enzymes, bile flow, and enhances natural appetite'
}
]
},
{
key: 'coffee',
tabName: 'Premium Coffee',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`,
eyebrow: '100% PURE COFFEE • NO ADDED CHICORY • RICH AROMA',
title: 'PREMIUM COFFEE,<br>PERFECT EVERYDAY',
subtitle: 'Crafted for true coffee lovers from the finest coffee beans. Rich aroma, smooth taste, and pure energy with zero added chicory.',
productId: 'coffee-50g',
price: 299,
originalPrice: 399,
unit: '50g',
image: '/coffee-hero.jpg',
thumbImage: '/coffee.jpg',
glowColor: 'rgba(139,69,19,0.45)',
accentBg: '#F8F4EE',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
label: '100% Pure'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
label: 'No Chicory'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
label: 'Rich Aroma'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
label: 'Smooth Taste'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
title: '100% Pure Coffee',
desc: 'Selected from finest beans with zero added chicory or fillers'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
title: 'Rich Volatile Aroma',
desc: 'Instant aroma release that elevates your morning coffee moments'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
title: 'Smooth Velvety Taste',
desc: 'Balanced acidity with a lingering, pleasant chocolatey finish'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
title: 'Easy to Prepare',
desc: 'Add 1-2 tsp to hot water or milk for an instant premium cup'
}
]
},
{
key: 'green-tea',
tabName: 'Green Tea',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
eyebrow: '100% NATURAL • NO ARTIFICIAL FLAVOURS • RICH IN ANTIOXIDANTS',
title: 'GOURSHAL GREEN TEA,<br>SIP NATURE, LIVE BETTER',
subtitle: 'Premium whole leaf green tea crafted with authentic Ayurvedic herbs and botanicals. Warm, revitalizing, and soothing in every sip.',
productId: 'tea-tulsi',
price: 199,
originalPrice: 249,
unit: '35g',
image: '/products/tea-tulsi.jpg',
thumbImage: '/products/tea-tulsi.jpg',
glowColor: 'rgba(74,124,37,0.45)',
accentBg: '#F3F7EE',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
label: '100% Natural'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
label: 'Boosts Immunity'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 2v7.31M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>`,
label: 'No Art. Flavours'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
label: 'Antioxidant Rich'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
title: 'Premium Whole Leaf',
desc: 'Tender whole green tea leaves rich in natural catechins & EGCG'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
title: 'Ayurvedic Botanicals',
desc: 'Enriched with pure Tulsi, Ashwagandha, Mint, Ginger & Lemon'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>`,
title: 'Rich in Antioxidants',
desc: 'Scavenges free radicals and supports daily cellular rejuvenation'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
title: 'Warm & Soothing',
desc: 'Made with love and care for an uplifting, refreshing daily cup'
}
]
},
{
key: 'spices',
tabName: 'Vedic Spices',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
eyebrow: '100% PURE & NATURAL • SUN DRIED • HYGIENICALLY PACKED',
title: 'PREMIUM SPICES,<br>CRAFTED TO LAST',
subtitle: 'Sun-dried, finely ground authentic Indian spices. Free from artificial colors, fillers, and adulteration for rich aroma and authentic flavor.',
productId: 'masala-garam',
price: 199,
originalPrice: 249,
unit: '200g',
image: '/products/garam-masala.jpg',
thumbImage: '/products/garam-masala.jpg',
glowColor: 'rgba(218,112,32,0.45)',
accentBg: '#FAF2E6',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
label: '100% Natural'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>`,
label: 'Fine Ground'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
label: 'Sun-Dried'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
label: 'Hygienic Packed'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
title: 'Rich Aroma',
desc: 'Perfect blend of whole spices providing unmatched fragrance'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>`,
title: 'Sun Dried Purity',
desc: 'Naturally solar dried to retain natural volatile essential oils'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
title: 'Fine Ground Flavour',
desc: 'Precision micro-milling for flawless blending in daily cooking'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
title: 'Zero Preservatives',
desc: 'No artificial colorants, no added MSG, and 100% natural spices'
}
]
},
{
key: 'honey',
tabName: 'Raw Honey',
tabIcon: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2L4 7v10l8 5 8-5V7z"/><path d="M12 12l8-5M12 12v10M12 12L4 7"/></svg>`,
eyebrow: 'RAW • UNHEATED • MULTI-FLORAL',
title: 'WILD FOREST HONEY,<br>NATURE’S LIQUID GOLD',
subtitle: 'Sourced from deep jungle hives in the Nilgiris and Sundarbans. Never heated, never pasteurized — packed with live pollen, enzymes, and rich nectar.',
productId: 'honey-500',
price: 749,
originalPrice: 949,
unit: '500g',
image: '/honey.jpg',
thumbImage: '/honey.jpg',
glowColor: 'rgba(218,165,32,0.5)',
accentBg: '#FAF6EB',
badges: [
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
label: 'Unfiltered Raw'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
label: 'Wild Forest'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
label: 'Live Enzymes'
},
{
icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
label: 'Zero Sugar Added'
}
],
benefits: [
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
title: 'Active Live Enzymes',
desc: 'Unheated process protects invertase, amylase & bio-enzymes'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
title: 'Soothes Cough & Throat',
desc: 'Natural antimicrobial coating relieves cough and irritation'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
title: 'Pure Clean Energy',
desc: 'Balanced fructose-glucose ratio delivers natural stamina'
},
{
icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/></svg>`,
title: 'Rich in Bee Pollen',
desc: 'Naturally builds seasonal allergy resistance and vitality'
}
]
}
];
const GOURSHAL_PRODUCTS = [
{
id: 'ghee-500',
name: 'A2 Vedic Bilona Pure Cow Ghee',
category: 'Pure Dairy',
categorySlug: 'ghee',
price: 899,
originalPrice: 1099,
unit: '500ml',
badge: 'BESTSELLER',
rating: 4.9,
reviews: 1420,
stock: 42,
description: 'Hand-churned from grass-fed A2 Gir cow milk using the ancient Vedic Bilona method. Rich granular golden texture.',
longDescription: `Our A2 Bilona Ghee is made using the traditional Vedic process — A2 whole milk is first cultured into curd, then churned bidirectional by hand to extract pure makkhan (butter), which is slow-simmered on a low wood flame.\n\nYields only 1 litre from 25-30 litres of pure A2 milk. Free from all preservatives, chemicals, and coloring.`,
benefits: ['Rich in Omega-3 and Omega-9 fatty acids', 'High smoke point (250°C) — ideal for cooking', 'Supports gut lining health and immune function', 'Contains natural CLA & butyric acid', 'Zero lactose and casein protein'],
ingredients: '100% A2 Desi Gir Cow Milk (Bilona Churned)',
glowColor: 'rgba(201,168,76,0.6)',
image: '/ghee.jpg'
},
{
id: 'ghee-1kg',
name: 'A2 Vedic Bilona Ghee — 1kg Family Pack',
category: 'Pure Dairy',
categorySlug: 'ghee',
price: 1699,
originalPrice: 2099,
unit: '1kg',
badge: 'SAVE 19%',
rating: 4.9,
reviews: 864,
stock: 28,
description: 'The same pure Vedic Bilona Cow Ghee in an economical 1kg glass jar for daily wellness and family nourishing.',
longDescription: `Everything exceptional about our 500ml A2 Bilona Ghee, packed in a 1kg luxury glass jar. Save 19% on daily family nourishment.`,
benefits: ['Bigger value for family cooking', 'Shelf stable for 12 months in airtight glass jar', 'Certified A2 cow milk source', 'Aromatic granular texture'],
ingredients: '100% A2 Desi Gir Cow Milk (Bilona Churned)',
glowColor: 'rgba(201,168,76,0.5)',
image: '/ghee.jpg'
},
{
id: 'mustard-oil-500',
name: 'GOURSHAL Kachi Ghani Mustard Oil',
category: 'Cold-Pressed Oils',
categorySlug: 'oils',
price: 349,
originalPrice: 449,
unit: '500ml',
badge: 'COLD-PRESSED',
rating: 4.9,
reviews: 620,
stock: 35,
description: 'Traditional cold-pressed virgin mustard oil in an authentic glass bottle. Cold-pressed below 35°C.',
longDescription: `Gourshal Kachi Ghani Mustard Oil is slowly extracted using traditional cold-pressing without generating heat. This preserves the intense natural pungent aroma (Allyl Isothiocyanate), natural Vitamin E, and heart-healthy unsaturated fats.\n\n100% single-ingredient, unbleached, and unrefined.`,
benefits: ['High MUFA & PUFA for heart wellness', 'Powerful natural antibacterial & antifungal', 'Stimulates digestive enzymes & appetite', 'Traditional remedy for deep hair massage & skin glow'],
ingredients: '100% First-Grade Indian Black Mustard Seeds (Cold-Pressed)',
glowColor: 'rgba(218,165,32,0.55)',
image: '/products/mustard-oil.jpg'
},
{
id: 'mustard-oil-1l',
name: 'Cold-Pressed Mustard Oil — 1 Litre Pack',
category: 'Cold-Pressed Oils',
categorySlug: 'oils',
price: 599,
originalPrice: 749,
unit: '1 Litre',
badge: '100% PURE',
rating: 4.9,
reviews: 410,
stock: 50,
description: 'Raw, unrefined cold-pressed mustard oil for authentic traditional Indian tadkas and health recipes.',
longDescription: `Full litre pack of pure cold-pressed extracted mustard oil.`,
benefits: ['Authentic pungent flavor', 'Zero mineral oils, zero argemone oil', 'Preserves heat-sensitive micronutrients'],
ingredients: '100% First-Grade Black Mustard Seeds',
glowColor: 'rgba(218,165,32,0.5)',
image: '/products/mustard-oil.jpg'
},
{
id: 'coffee-50g',
name: 'GOURSHAL Premium Coffee (50g)',
category: 'Artisan Coffee',
categorySlug: 'coffee',
price: 299,
originalPrice: 399,
unit: '50g',
badge: '100% PURE',
rating: 5.0,
reviews: 780,
stock: 45,
description: '100% Pure Coffee, No Added Chicory. Selected from finest coffee beans for rich aroma and smooth taste.',
longDescription: `Crafted for true coffee lovers. GOURSHAL Premium Coffee is made from the finest beans, carefully selected for a rich aroma and smooth taste. Perfect for your everyday coffee moments.`,
benefits: ['100% Pure Coffee — Zero added chicory', 'Rich volatile aroma and smooth velvety taste', 'Easy to prepare — instant dissolving granules', 'Hygienically packed in amber glass jar with airtight seal'],
ingredients: '100% Pure Coffee',
glowColor: 'rgba(120,80,40,0.7)',
image: '/coffee.jpg'
},
{
id: 'tea-tulsi',
name: 'GOURSHAL Tulsi Green Tea (35g)',
category: 'Green Teas',
categorySlug: 'tea',
price: 199,
originalPrice: 249,
unit: '35g',
badge: 'IMMUNITY BOOSTER',
rating: 4.9,
reviews: 620,
stock: 60,
description: '100% Natural whole leaf green tea with sacred Tulsi. Boosts immunity, rich in antioxidants, no artificial flavours.',
longDescription: `GOURSHAL Tulsi Green Tea blends premium whole leaf green tea with sacred holy basil (Tulsi). A pure, natural immunity-boosting infusion that rejuvenates mind and body with every sip.`,
benefits: ['100% Natural — No artificial flavours or chemicals', 'Boosts natural immunity & cellular defense', 'Rich in active catechins & antioxidants', 'Sip nature, live better — soothing aroma'],
ingredients: 'Premium Whole Leaf Green Tea, Sacred Holy Basil (Tulsi)',
glowColor: 'rgba(74,124,37,0.5)',
image: '/products/tea-tulsi.jpg'
},
{
id: 'tea-ashwagandha',
name: 'GOURSHAL Ashwagandha Green Tea (35g)',
category: 'Green Teas',
categorySlug: 'tea',
price: 219,
originalPrice: 269,
unit: '35g',
badge: 'STRESS RELIEF',
rating: 5.0,
reviews: 540,
stock: 55,
description: 'Calm mind, better you. Enriched with authentic Indian Ashwagandha root to help reduce stress & anxiety.',
longDescription: `Specially crafted for calm and relaxation. GOURSHAL Ashwagandha Green Tea pairs high-grade whole green tea leaves with adaptogenic Ashwagandha root to soothe anxiety and promote restful balance.`,
benefits: ['Enriched with adaptogenic Ashwagandha root', 'Helps reduce stress, fatigue & anxiety', 'Supports mental clarity & calm focus', 'Made with love and care — 100% natural'],
ingredients: 'Premium Whole Leaf Green Tea, Pure Ashwagandha Root',
glowColor: 'rgba(139,90,43,0.5)',
image: '/products/tea-ashwagandha.jpg'
},
{
id: 'tea-ginger',
name: 'GOURSHAL Ginger Green Tea (35g)',
category: 'Green Teas',
categorySlug: 'tea',
price: 199,
originalPrice: 249,
unit: '35g',
badge: 'WARM & REVITALIZING',
rating: 4.9,
reviews: 480,
stock: 50,
description: 'Warm & revitalizing whole leaf green tea with natural ginger goodness. Warming, soothing, and supports healthy digestion.',
longDescription: `GOURSHAL Ginger Green Tea combines tender whole leaf green tea with pure sun-dried ginger. A warming, comforting cup that stimulates digestion and boosts daily metabolic vitality.`,
benefits: ['Natural ginger goodness with warming aroma', 'Soothes throat & ignites digestive agni', 'Boosts immunity and cleanses toxins', 'Zero artificial flavours or preservatives'],
ingredients: 'Premium Whole Leaf Green Tea, Sun-Dried Ginger Flakes',
glowColor: 'rgba(218,140,32,0.5)',
image: '/products/tea-ginger.jpg'
},
{
id: 'tea-mint',
name: 'GOURSHAL Mint Green Tea (35g)',
category: 'Green Teas',
categorySlug: 'tea',
price: 199,
originalPrice: 249,
unit: '35g',
badge: 'COOL & REFRESHING',
rating: 4.8,
reviews: 390,
stock: 48,
description: 'Cool & refreshing whole leaf green tea with aromatic garden mint. Pure refreshing goodness in every sip.',
longDescription: `Refresh your senses with GOURSHAL Mint Green Tea. Sourced from the finest tea gardens and blended with cooling garden mint leaves for a crisp, revitalizing daily hydration ritual.`,
benefits: ['Refreshing aromatic mint blend', 'Cooling & soothing effect on stomach', 'Rich in natural antioxidants & polyphenols', '100% natural whole leaf — zero bitter aftertaste'],
ingredients: 'Premium Whole Leaf Green Tea, Pure Garden Mint Leaves',
glowColor: 'rgba(46,139,87,0.5)',
image: '/products/tea-mint.jpg'
},
{
id: 'tea-lemon',
name: 'GOURSHAL Lemon Green Tea (35g)',
category: 'Green Teas',
categorySlug: 'tea',
price: 199,
originalPrice: 249,
unit: '35g',
badge: 'ZESTY & REFRESHING',
rating: 4.9,
reviews: 510,
stock: 52,
description: 'Zesty & refreshing green tea with sun-ripened lemon zest. Refreshing goodness that elevates your daily energy.',
longDescription: `Brighten your mornings with GOURSHAL Lemon Green Tea. Whole leaf green tea combined with invigorating citrus lemon notes for a zesty, crisp, and revitalizing antioxidant drink.`,
benefits: ['Zesty lemon flavour with natural aroma', 'Sourced from finest organic tea gardens', 'Rich in natural Vitamin C & bioflavonoids', 'Promotes active daily detoxification'],
ingredients: 'Premium Whole Leaf Green Tea, Natural Dried Lemon Peels & Zest',
glowColor: 'rgba(220,180,20,0.5)',
image: '/products/tea-lemon.jpg'
},
{
id: 'masala-garam',
name: 'GOURSHAL Premium Garam Masala',
category: 'Vedic Spices',
categorySlug: 'spices',
price: 199,
originalPrice: 249,
unit: '200g',
badge: 'BESTSELLER',
rating: 5.0,
reviews: 640,
stock: 50,
description: '100% Pure & Natural premium spice blend. Rich aroma, sun-dried, fine ground for authentic flavour.',
longDescription: `GOURSHAL Premium Garam Masala is a signature handpicked blend of royal whole spices. Sun-dried to preserve essential oils and finely ground in hygienic conditions to elevate everyday cooking with authentic aroma.`,
benefits: ['Rich aroma & perfect blend of whole spices', 'Sun-dried for natural goodness', 'Fine ground for better flavour', '100% pure, natural and hygienically packed'],
ingredients: 'Handpicked Royal Spices (Cardamom, Cinnamon, Cloves, Star Anise, Black Pepper, Nutmeg)',
glowColor: 'rgba(180,80,20,0.6)',
image: '/products/garam-masala.jpg'
},
{
id: 'masala-turmeric',
name: 'GOURSHAL Premium Turmeric Powder',
category: 'Vedic Spices',
categorySlug: 'spices',
price: 189,
originalPrice: 239,
unit: '200g',
badge: 'HIGH CURCUMIN',
rating: 5.0,
reviews: 820,
stock: 45,
description: 'Rich in curcumin naturally. Handpicked finest turmeric roots, sun-dried for purity and finely ground.',
longDescription: `GOURSHAL Premium Turmeric Powder contains high natural active curcumin. Ethically harvested, sun-dried, and finely ground without synthetic dyes, lead chromate, or starches.`,
benefits: ['Rich in Curcumin naturally', 'Handpicked finest whole turmeric roots', 'Sun-dried for purity & natural color', 'Hygienically packed for maximum freshness'],
ingredients: '100% Pure Handpicked Turmeric Rhizomes',
glowColor: 'rgba(230,130,20,0.6)',
image: '/products/turmeric-powder.jpg'
},
{
id: 'masala-coriander',
name: 'GOURSHAL Premium Coriander Powder',
category: 'Vedic Spices',
categorySlug: 'spices',
price: 169,
originalPrice: 219,
unit: '200g',
badge: 'RICH AROMA',
rating: 4.9,
reviews: 430,
stock: 40,
description: '100% Pure & Natural dhania powder from handpicked coriander seeds. Intense aroma and vibrant green note.',
longDescription: `GOURSHAL Premium Coriander Powder is ground from carefully selected, sun-dried coriander seeds. Adds a refreshing citrusy aroma and rich texture to Indian curries.`,
benefits: ['Handpicked premium coriander seeds', 'Sun-dried for natural goodness', 'Fine ground for better flavour & smooth gravy', 'Zero added color or preservatives'],
ingredients: '100% Handpicked Pure Coriander Seeds',
glowColor: 'rgba(80,140,50,0.6)',
image: '/products/coriander-powder.jpg'
},
{
id: 'masala-kitchen-king',
name: 'GOURSHAL Premium Kitchen King Masala',
category: 'Vedic Spices',
categorySlug: 'spices',
price: 219,
originalPrice: 269,
unit: '200g',
badge: 'ALL-IN-ONE',
rating: 4.9,
reviews: 510,
stock: 38,
description: 'The master blend for everyday cooking. Perfect harmony of spices for rich gravy and curries.',
longDescription: `GOURSHAL Kitchen King Masala is an all-purpose spice masterpiece that transforms everyday vegetable and paneer preparations into restaurant-quality culinary delights.`,
benefits: ['Rich aroma & perfect blend for everyday cooking', 'Sun-dried for natural goodness', 'Authentic traditional taste', 'Hygienically packed in multi-barrier pouch'],
ingredients: 'Master Blend of 20+ Handpicked Spices & Herbs',
glowColor: 'rgba(160,90,30,0.6)',
image: '/products/kitchen-king.jpg'
},
{
id: 'masala-red-chilli',
name: 'GOURSHAL Premium Red Chilli Powder',
category: 'Vedic Spices',
categorySlug: 'spices',
price: 199,
originalPrice: 249,
unit: '200g',
badge: 'HOT & PUNGENT',
rating: 4.9,
reviews: 690,
stock: 42,
description: 'Carefully selected whole red chillies. Rich natural crimson color, hot & pungent flavour.',
longDescription: `GOURSHAL Red Chilli Powder is made from whole stemless red chillies, sun-dried and ground to perfection. Gives vibrant natural red color and appetizing heat without artificial dyes.`,
benefits: ['Rich natural color & appetizing heat', 'Handpicked quality red chillies', 'Sun-dried for natural color preservation', 'Zero artificial colors (Sudan red free)'],
ingredients: '100% Pure Stemless Red Chillies',
glowColor: 'rgba(200,40,20,0.6)',
image: '/products/red-chilli.jpg'
},
{
id: 'honey-500',
name: 'Raw Wild Forest Jungle Honey',
category: 'Wild Forest',
categorySlug: 'honey',
price: 749,
originalPrice: 949,
unit: '500g',
badge: 'UNFILTERED RAW',
rating: 4.9,
reviews: 1120,
stock: 34,
description: 'Raw, unheated, unpasteurized honey gathered from wild forest beehives. Packed with live enzymes, pollen & antioxidants.',
longDescription: `Harvested by indigenous forest tribes from wild hives in deep biodiverse jungles. Never micro-filtered or heated above natural hive temperatures (35°C), ensuring all active bee pollen, propolis, and live enzymes remain intact.\n\nNatural crystallization is proof of 100% purity and zero corn syrup.`,
benefits: ['Rich in live enzymes (diastase & invertase)', 'Natural soothe for throat infections & cough', 'Sustained healthy prebiotic energy', '100% raw and unfiltered'],
ingredients: '100% Pure Raw Multi-Floral Wild Forest Honey',
glowColor: 'rgba(200,140,40,0.6)',
image: '/honey.jpg'
}
];
window.GOURSHAL_HERO_PRODUCTS = GOURSHAL_HERO_PRODUCTS;
window.GOURSHAL_PRODUCTS = GOURSHAL_PRODUCTS;
window.GOURSHAL_PRODUCTS_LOCAL = GOURSHAL_PRODUCTS;
async function initProducts() {
try {
const apiUrl = window.Config ? Config.API_URL : (window.location.hostname === 'localhost' ? 'http:
const res = await fetch(apiUrl + '/products');
const data = await res.json();
if (data.ok && data.products && data.products.length > 0) {
window.GOURSHAL_PRODUCTS = data.products;
if (window.Cart) Cart.updateUI();
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new Event('productsLoaded'));
}
return;
}
} catch (e) {
}
if (window.Cart) Cart.updateUI();
if (typeof window.dispatchEvent === 'function') {
window.dispatchEvent(new Event('productsLoaded'));
}
}
initProducts();
function getStockStatus(stock) {
if (stock <= 0) return { class: 'out-of-stock', label: 'Out of Stock' };
if (stock < 10) return { class: 'low-stock', label: `Only ${stock} left in batch` };
return { class: 'in-stock', label: 'In Stock' };
}
window.getStockStatus = getStockStatus;

// ─── utils.js ───
const Utils = {
sanitizeHTML(str) {
if (typeof str !== 'string') return '';
const div = document.createElement('div');
div.textContent = str;
return div.innerHTML;
},
validateEmail(email) {
if (!email || typeof email !== 'string') return false;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return emailRegex.test(email.trim());
},
validatePhone(phone) {
if (!phone || typeof phone !== 'string') return false;
const cleanPhone = phone.replace(/\D/g, '');
return cleanPhone.length >= 10 && cleanPhone.length <= 15;
},
debounce(fn, ms) {
let timer;
return function(...args) {
clearTimeout(timer);
timer = setTimeout(() => fn.apply(this, args), ms);
};
},
formatCurrency(amount) {
return new Intl.NumberFormat('en-IN', {
style: 'currency',
currency: 'INR',
minimumFractionDigits: 0,
maximumFractionDigits: 0
}).format(amount);
},
formatDate(date) {
return new Date(date).toLocaleDateString('en-IN', {
day: 'numeric',
month: 'long',
year: 'numeric'
});
},
sanitizeInput(input) {
if (!input || typeof input !== 'string') return '';
return input.trim().replace(/[<>]/g, '');
},
getCSRFToken() {
return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}
};
window.Utils = Utils;

// ─── vps-deploy-live.js ───
const { Client } = require('../backend/node_modules/ssh2');
const config = {
host: process.env.VPS_HOST || '200.234.39.211',
port: parseInt(process.env.VPS_PORT || '22', 10),
username: process.env.VPS_USER || 'root',
password: process.env.VPS_PASSWORD || 'Gourshal@2000',
readyTimeout: 30000
};
const conn = new Client();
function runCommand(cmd) {
return new Promise((resolve, reject) => {
console.log(`\n🔹 Running: ${cmd}`);
conn.exec(cmd, (err, stream) => {
if (err) return reject(err);
let out = '';
let errOut = '';
stream.on('close', (code) => {
console.log(`Exit code: ${code}`);
resolve({ code, out, errOut });
}).on('data', (d) => {
const str = d.toString();
out += str;
process.stdout.write(str);
}).stderr.on('data', (d) => {
const str = d.toString();
errOut += str;
process.stderr.write(str);
});
});
});
}
console.log(`Connecting to Hostinger VPS at ${config.host}...`);
conn.on('ready', async () => {
console.log('✅ Connected to VPS!');
try {
await runCommand('pm2 list || true');
const deployScript = `
if [ -d "/var/www/gourshal" ]; then
cd /var/www/gourshal
echo "=== Updating /var/www/gourshal ==="
git fetch --all
git reset --hard origin/main
git pull origin main
npm install --production=false
npm run build || node scripts/build.js || true
pm2 restart all || pm2 restart gourshal || systemctl restart gourshal || true
fi
if [ -d "$HOME/gourshal" ]; then
cd $HOME/gourshal
echo "=== Updating $HOME/gourshal ==="
git fetch --all
git reset --hard origin/main
git pull origin main
npm install --production=false
npm run build || node scripts/build.js || true
pm2 restart all || pm2 restart gourshal || true
fi
if [ -f "$HOME/deploy-backend.sh" ]; then
echo "=== Running ~/deploy-backend.sh ==="
bash $HOME/deploy-backend.sh || true
fi
`;
await runCommand(deployScript);
await runCommand('systemctl reload nginx || nginx -s reload || true');
await runCommand('pm2 list || true');
console.log('\n🎉 VPS Live Deployment Completed Successfully!');
} catch (err) {
console.error('Error during deployment:', err);
} finally {
conn.end();
}
}).on('error', (err) => {
console.error('SSH connection failed:', err);
}).connect(config);
