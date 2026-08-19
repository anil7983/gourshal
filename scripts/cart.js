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
    const product = productList.find(p => p.id === productId || p.productId === productId || p._id === productId);
    
    if (!product) {
      console.warn('Product not found:', productId);
      // Fallback create minimal item if ID exists
      const existing = items.find(i => i.id === productId);
      if (existing) {
        existing.qty += (qty || 1);
      } else {
        items.push({ id: productId, qty: qty || 1, name: 'Gourshal Item', price: 899, stock: 50 });
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
    const existing = items.find(i => i.id === pId || i.id === productId);
    
    if (existing) {
      const newQty = Math.min(existing.qty + (qty || 1), safeStock);
      existing.qty = newQty;
      if (newQty >= safeStock) {
        this.showToast(`Maximum available stock reached for ${product.name}`);
      }
    } else {
      const safeQty = Math.min(qty || 1, safeStock);
      items.push({ id: pId, qty: safeQty, name: product.name, price: product.price, stock: safeStock });
    }
    
    this.save(items);
    this.showToast(`Added to cart: ${product.name}`);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
  },

  remove(productId) {
    const items = this.get().filter(i => i.id !== productId && i.productId !== productId);
    this.save(items);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
  },

  updateQty(productId, qty) {
    const items = this.get();
    const item = items.find(i => i.id === productId || i.productId === productId);
    if (!item) return;
    
    if (qty <= 0) {
      this.remove(productId);
      return;
    }

    const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
    const product = productList.find(p => p.id === productId || p.productId === productId);
    const maxQty = product?.stock || 50;
    
    if (qty > maxQty) {
      item.qty = maxQty;
      this.showToast(`Limited to ${maxQty} units in stock`);
    } else {
      item.qty = qty;
    }
    
    this.save(items);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items, count: this.count() } }));
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateUI();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [], count: 0 } }));
  },

  count() {
    return this.get().reduce((s, i) => s + (Number(i.qty) || 0), 0);
  },

  total() {
    const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
    return this.get().reduce((s, i) => {
      const p = productList.find(pr => pr.id === i.id || pr.productId === i.id || pr._id === i.id);
      const price = p ? (Number(p.price) || 0) : (Number(i.price) || 0);
      return s + price * (Number(i.qty) || 1);
    }, 0);
  },

  getItems() {
    const productList = window.GOURSHAL_PRODUCTS || window.GOURSHAL_PRODUCTS_LOCAL || [];
    return this.get().map(item => {
      const product = productList.find(p => p.id === item.id || p.productId === item.id || p._id === item.id);
      if (!product) {
        return {
          ...item,
          product: {
            id: item.id,
            productId: item.id,
            name: item.name || 'Gourshal Product',
            price: item.price || 899,
            stock: 50,
            unit: '500ml',
            image: '/ghee.jpg',
            category: 'Pure Vedic'
          }
        };
      }
      return { ...item, product };
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
    const toast = document.getElementById('cartToast');
    const text = document.getElementById('toastText') || (toast ? toast.querySelector('.toast-text, span') : null);
    if (!toast) return;
    if (text) {
      text.textContent = msg;
    } else {
      toast.innerHTML = `<div class="toast-icon">✓</div><div class="toast-text">${msg}</div>`;
    }
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
};

// Init cart UI on page load
document.addEventListener('DOMContentLoaded', () => Cart.updateUI());
window.Cart = Cart;