// ═══════════════════════════════════════════════════
//  GOURSHAL — COMPLETE PRODUCT DATA CATALOG
// ═══════════════════════════════════════════════════

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
  // ── Ghee ──
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

  // ── Cold-Pressed Mustard Oil ──
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

  // ── Coffee ──
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

  // ── OFFICIAL GOURSHAL GREEN TEA BLENDS (ALL 5 POUCHES) ──
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

  // ── OFFICIAL GOURSHAL PREMIUM SPICES (ALL 5 POUCHES) ──
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

  // ── Honey ──
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

// Async init function to fetch real products if backend is running
async function initProducts() {
  try {
    const apiUrl = window.Config ? Config.API_URL : (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : window.location.origin + '/api');
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
    // Backend unavailable, fallback to local
  }
  if (window.Cart) Cart.updateUI();
  if (typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('productsLoaded'));
  }
}

initProducts();

// Helper to get stock status indicator
function getStockStatus(stock) {
  if (stock <= 0) return { class: 'out-of-stock', label: 'Out of Stock' };
  if (stock < 10) return { class: 'low-stock', label: `Only ${stock} left in batch` };
  return { class: 'in-stock', label: 'In Stock' };
}

window.getStockStatus = getStockStatus;