const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

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
    longDescription: 'Our A2 Bilona Ghee is made using the traditional Vedic process — A2 whole milk is first cultured into curd, then churned bidirectional by hand to extract pure makkhan (butter), which is slow-simmered on a low wood flame.',
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
    longDescription: 'Everything exceptional about our 500ml A2 Bilona Ghee, packed in a 1kg luxury glass jar. Save 19% on daily family nourishment.',
    benefits: ['Bigger value for family cooking', 'Shelf stable for 12 months in airtight glass jar', 'Certified A2 cow milk source', 'Aromatic granular texture'],
    ingredients: '100% A2 Desi Gir Cow Milk (Bilona Churned)',
    glowColor: 'rgba(201,168,76,0.5)',
    image: '/ghee.jpg'
  },
  {
    productId: 'mustard-oil-500',
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
    longDescription: 'Gourshal Kachi Ghani Mustard Oil is slowly extracted using traditional cold-pressing without generating heat. This preserves the intense natural pungent aroma, natural Vitamin E, and heart-healthy unsaturated fats.',
    benefits: ['High MUFA & PUFA for heart wellness', 'Powerful natural antibacterial & antifungal', 'Stimulates digestive enzymes & appetite', 'Traditional remedy for deep hair massage & skin glow'],
    ingredients: '100% First-Grade Indian Black Mustard Seeds (Cold-Pressed)',
    glowColor: 'rgba(218,165,32,0.55)',
    image: '/products/mustard-oil.jpg'
  },
  {
    productId: 'mustard-oil-1l',
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
    longDescription: 'Full litre pack of pure cold-pressed extracted mustard oil.',
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
    longDescription: 'Crafted for true coffee lovers. GOURSHAL Premium Coffee is made from the finest beans, carefully selected for a rich aroma and smooth taste. Perfect for your everyday coffee moments.',
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
    longDescription: 'GOURSHAL Tulsi Green Tea blends premium whole leaf green tea with sacred holy basil (Tulsi). A pure, natural immunity-boosting infusion that rejuvenates mind and body with every sip.',
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
    longDescription: 'Specially crafted for calm and relaxation. GOURSHAL Ashwagandha Green Tea pairs high-grade whole green tea leaves with adaptogenic Ashwagandha root to soothe anxiety and promote restful balance.',
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
    longDescription: 'GOURSHAL Ginger Green Tea combines tender whole leaf green tea with pure sun-dried ginger. A warming, comforting cup that stimulates digestion and boosts daily metabolic vitality.',
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
    longDescription: 'Refresh your senses with GOURSHAL Mint Green Tea. Sourced from the finest tea gardens and blended with cooling garden mint leaves for a crisp, revitalizing daily hydration ritual.',
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
    longDescription: 'Brighten your mornings with GOURSHAL Lemon Green Tea. Whole leaf green tea combined with invigorating citrus lemon notes for a zesty, crisp, and revitalizing antioxidant drink.',
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
    longDescription: 'GOURSHAL Premium Garam Masala is a signature handpicked blend of royal whole spices. Sun-dried to preserve essential oils and finely ground.',
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
    longDescription: 'GOURSHAL Premium Turmeric Powder contains high natural active curcumin. Ethically harvested, sun-dried, and finely ground.',
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
    longDescription: 'GOURSHAL Premium Coriander Powder is ground from carefully selected, sun-dried coriander seeds.',
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
    longDescription: 'GOURSHAL Kitchen King Masala is an all-purpose spice masterpiece for rich daily curries.',
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
    longDescription: 'GOURSHAL Red Chilli Powder is made from whole stemless red chillies, sun-dried and ground to perfection.',
    benefits: ['Rich natural color & appetizing heat', 'Handpicked quality red chillies', 'Sun-dried for natural color preservation', 'Zero artificial colors'],
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
    longDescription: 'Harvested by indigenous forest tribes from wild hives in deep biodiverse jungles. Never micro-filtered or heated above natural hive temperatures (35°C).',
    benefits: ['Rich in live enzymes (diastase & invertase)', 'Natural soothe for throat infections & cough', 'Sustained healthy prebiotic energy', '100% raw and unfiltered'],
    ingredients: '100% Pure Raw Multi-Floral Wild Forest Honey',
    glowColor: 'rgba(200,140,40,0.6)',
    image: '/honey.jpg'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');
    
    const bcrypt = require('bcryptjs');
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || require('crypto').randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(initialPassword, salt);
      admin = await User.create({
        name: 'Gourshal Admin',
        email: process.env.FIRST_ADMIN_EMAIL || 'admin@gourshal.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`Created default admin user: ${admin.email}`);
      if (!process.env.INITIAL_ADMIN_PASSWORD) {
        console.log(`Auto-generated admin password: ${initialPassword}`);
      }
    }
    
    await Product.deleteMany({});
    console.log('Cleared existing products.');
    
    const formatted = GOURSHAL_PRODUCTS.map(p => {
      const prod = { ...p };
      prod.productId = p.productId || p.id;
      delete prod.id;
      prod.adminId = admin._id;
      return prod;
    });
    
    await Product.insertMany(formatted);
    console.log(`Successfully seeded ${formatted.length} Gourshal products into MongoDB Atlas!`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seed();
