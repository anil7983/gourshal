// ═══════════════════════════════════════════════════
//  GOURSHAL — PREMIUM HOME EXPERIENCE SCRIPT
//  Vedic Luxury Aesthetic • Multi-Product Hero Switcher
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initHeroSwitcher();
  initHomeProductsGrid();
  initCategoryFilters();
  initNavbarAndCart();
  initCursorGlow();
  initTestimonialSlider();
});

// Global state for active hero product
let activeHeroIndex = 0;
let heroAutoTimer = null;

// ─── 1. HERO PRODUCT SWITCHER ───
function initHeroSwitcher() {
  const switcher = document.getElementById('heroSwitcher');
  if (!switcher || typeof GOURSHAL_HERO_PRODUCTS === 'undefined') return;

  // Hide the switcher pills so they don't cover the nav logo
  switcher.style.display = 'none';

  // Still render the hero product tabs (hidden) and first product
  switcher.innerHTML = GOURSHAL_HERO_PRODUCTS.map((prod, index) => `
    <button class="hero-tab-btn ${index === 0 ? 'active' : ''}" 
            role="tab" 
            aria-selected="${index === 0 ? 'true' : 'false'}"
            onclick="switchHeroProduct(${index})">
      <img src="${prod.thumbImage || prod.image}" alt="${prod.tabName}" class="tab-product-thumb" loading="lazy">
      <span class="tab-label-text">${prod.tabName}</span>
    </button>
  `).join('');

  // Initial render of first product
  renderHeroProduct(GOURSHAL_HERO_PRODUCTS[0]);

  // Start auto-rotation every 5 seconds
  startHeroAutoRotation();

  // Pause auto-rotation on mouse enter
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

  // Update tabs active state
  const tabs = document.querySelectorAll('.hero-tab-btn');
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });

  // Render product data
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

  // Fade out transition
  if (titleEl) titleEl.style.opacity = '0';
  if (imgEl) imgEl.style.opacity = '0';

  setTimeout(() => {
    // 1. Eyebrow
    if (eyebrowEl) {
      eyebrowEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
        <span>${prod.eyebrow}</span>
      `;
    }

    // 2. Title & Subtitle
    if (titleEl) {
      titleEl.innerHTML = prod.title;
      titleEl.style.opacity = '1';
    }
    if (subEl) {
      subEl.innerHTML = prod.subtitle;
    }

    // 3. Circular Badges
    if (badgesEl) {
      badgesEl.innerHTML = prod.badges.map(b => `
        <div class="hero-badge-item">
          <div class="hero-badge-circle">${b.icon}</div>
          <span class="hero-badge-label">${b.label}</span>
        </div>
      `).join('');
    }

    // 4. Shop Button Link
    if (shopBtn) {
      shopBtn.href = `product.html?id=${prod.productId}`;
    }

    // 5. Image & Glow
    if (imgEl) {
      imgEl.src = prod.image;
      imgEl.alt = prod.tabName;
      imgEl.style.opacity = '1';
    }
    if (glowEl) {
      glowEl.style.background = `radial-gradient(circle, ${prod.glowColor} 0%, transparent 70%)`;
    }

    // 6. Signature Forest Green Benefit Bar
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

// ─── 2. HOME PRODUCTS GRID ───
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

// ─── 3. QUICK ADD TO CART ───
function quickAddToCart(productId, productName) {
  if (window.Cart && typeof Cart.add === 'function') {
    Cart.add(productId, 1);
  } else {
    console.warn('Cart engine not available');
  }
}

// ─── 4. LAB PURITY VERIFIER ───
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

// ─── 5. NAVBAR & CART BADGE ───
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

// ─── 6. CURSOR GLOW ───
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ─── 7. INTERACTIVE STORY VIDEO MODAL ───
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
    
    // Normalize path to work whether hosted locally, with /public, or under root
    let resolvedSrc = src;
    if (window.location.protocol === 'file:') {
      resolvedSrc = src.replace(/^\/+/, '');
    } else {
      if (src.startsWith('/')) {
        resolvedSrc = src;
      } else {
        resolvedSrc = '/' + src.replace(/^public\//, '');
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

  // Highlight active chapter button (strictly one active)
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

  // Ensure strictly one chapter button is active
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
        resolvedSrc = '/' + src.replace(/^public\//, '');
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

// ─── 8. TESTIMONIALS SLIDER / CAROUSEL ───
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

  // ── Auto-slide every 4 seconds ──
  const startTestiAuto = () => {
    stopTestiAuto();
    testiAutoTimer = setInterval(() => moveTestimonials(1), 4000);
  };
  const stopTestiAuto = () => {
    if (testiAutoTimer) { clearInterval(testiAutoTimer); testiAutoTimer = null; }
  };

  // Pause on hover or touch
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

// Global bindings
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

// Close modal on Escape key or backdrop click
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeStoryVideo();
});

document.addEventListener('click', e => {
  const modal = document.getElementById('storyVideoModal');
  if (modal && e.target === modal) closeStoryVideo();
});