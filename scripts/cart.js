// ═══════════════════════════════════════════════════
//  GOURSHAL — CART ENGINE
// ═══════════════════════════════════════════════════

const Cart = {
  STORAGE_KEY: 'gourshal_cart',

  get API_URL() {
    return window.Config ? Config.API_URL : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : window.location.origin + '/api');
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
    
    // Update all cart count badges across all pages
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

// Init cart UI on page load
document.addEventListener('DOMContentLoaded', () => Cart.updateUI());
window.Cart = Cart;