# 🌿 GOURSHAL FOODS — Premium E-Commerce Platform

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.18.2-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-emerald.svg)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/payments-Razorpay-blueviolet.svg)](https://razorpay.com/)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)](#)

**Pure Vedic A2 Gir Cow Bilona Ghee | Cold-Pressed Kachi Ghani Mustard Oil | Single-Origin Spices | Herbal Teas | Artisanal Coffee**

[Live Storefront](https://gourshal.com) • [Explore Features](#-features) • [Tech Stack](#-technology-stack) • [Quickstart](#-getting-started) • [API Documentation](#-api-endpoints) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

**Gourshal Foods** is a modern, high-performance direct-to-consumer (D2C) e-commerce web platform dedicated to delivering 100% pure, lab-tested, traditional Indian organic foods. Built with zero frontend bloat using semantic HTML5, modern CSS3 glassmorphism, modular Vanilla JavaScript, and an enterprise-grade Node.js/Express backend powered by MongoDB and Razorpay.

Every batch of our Vedic A2 Bilona Ghee and Cold-Pressed Mustard Oil is accompanied by direct **Laboratory Purity Certificates** verifiable right on the website.

---

## ✨ Features

### 🛒 E-Commerce & Customer Experience
- **Responsive Storefront**: Fluid, mobile-first design with smooth glassmorphism aesthetics and micro-interactions.
- **Product Catalog & Filtering**: Categorized views (A2 Ghee, Wood-Pressed Oils, Handcrafted Spices, Herbal Wellness Teas, Single-Origin Coffee).
- **Persistent Cart & Checkout**: LocalStorage-persisted shopping cart with quantity controls, dynamic price recalculation, and coupon code support.
- **Razorpay Payment Gateway**: Seamless and secure digital checkout with instant payment verification, auto-calculated totals, and invoice generation.
- **Customer Authentication**: Secure user registration, login, profile management, and live order tracking.

### 🛡️ Vedic Purity Lab Verification
- **Batch Authenticity Engine**: Customers can inspect physical lab test reports, Reichert-Meissl (RM) values, Iodine values, and Peroxide indices for every production run.
- **Farm-to-Kitchen Traceability**: Transparent sourcing from indigenous Gir cows and organic partner farms.

### 🔐 Security & Backend Architecture
- **Enterprise Middleware**: Rate limiting (`express-rate-limit`), NoSQL injection protection (`express-mongo-sanitize`), CORS whitelisting, and HTTP security headers via `helmet`.
- **JWT & Password Security**: Industry-standard JSON Web Token sessions and bcrypt-hashed password credentials.
- **Admin Dashboard**: Dedicated administration interface for order fulfillment, product inventory adjustments, and status tracking.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) | Ultra-fast load times, zero external JS framework bloat, glassmorphism design system |
| **Backend** | Node.js, Express.js | RESTful API architecture, modular route controllers, robust error handling |
| **Database** | MongoDB & Mongoose ODM | Schema-validated collections for Users, Products, and Orders |
| **Payments** | Razorpay Node SDK | Compliant Indian & international digital payment processing |
| **Security** | Helmet, Bcryptjs, JWT, Rate-Limit | Defense-in-depth protection against common web vulnerabilities |
| **DevOps / Hosting** | Nginx, PM2, Docker, Linux (VPS) | Reverse proxy, SSL termination, process supervisor, containerization |

---

## 📂 Project Structure

```bash
gourshal/
├── index.html                  # Homepage (Hero, USP, Purity showcase, Testimonials)
├── shop.html                   # Product catalog with category filter & search
├── product.html                # Individual product details & lab certificates
├── cart.html                   # Persistent shopping cart & order summary
├── checkout.html               # Customer shipping details & Razorpay payment trigger
├── login.html                  # User sign-in & registration
├── orders.html                 # Customer order history & tracking
├── about.html                  # Story of Gourshal Foods & traditional processes
├── contact.html                # Customer support & inquiry form
├── privacy.html                # Privacy policy (M/S. Gourshal Foods)
├── terms.html                  # Terms & conditions and refund policies
│
├── styles/
│   ├── main.css                # Global design tokens, navbar, footer, buttons, modal
│   └── home.css                # Homepage hero, testimonial carousel & banner styles
│
├── scripts/
│   ├── config.js               # Global API base URL configuration & helper constants
│   ├── auth.js                 # JWT token handling, login/signup API bindings
│   ├── cart.js                 # Cart state management (LocalStorage) & badges
│   ├── home.js                 # Testimonial slider, batch verification, hero interactions
│   ├── products.js             # Dynamic product fetching, filtering & quick views
│   ├── effects.js              # Navbar scroll animations & UI micro-interactions
│   ├── utils.js                # Toast notifications, currency formatting & helpers
│   └── build.js                # Asset bundler and minifier script
│
├── public/
│   ├── favicon.svg             # Vector site icon
│   ├── manifest.json           # Progressive Web App manifest
│   ├── robots.txt              # SEO crawler directives
│   ├── sitemap.xml             # Search engine sitemap
│   ├── products/               # High-resolution optimized product imagery
│   └── videos/                 # Authentic farm & processing footage (WebM / MP4)
│
├── backend/
│   ├── server.js               # Express app bootstrap, middleware & MongoDB connection
│   ├── seed.js                 # Initial catalog seeder (Ghee, Oils, Spices, Teas, Coffee)
│   ├── package.json            # Backend dependencies & runtime scripts
│   ├── .env.example            # Environment variables template
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication & admin authorization guards
│   │   ├── errorHandler.js     # Centralized error handler
│   │   ├── rateLimiter.js      # API rate limiting policies
│   │   └── validate.js         # Request payload validator
│   ├── models/
│   │   ├── User.js             # User accounts & address book
│   │   ├── Product.js          # Product schemas, pricing, inventory & lab reports
│   │   └── Order.js            # Customer orders, Razorpay transaction records & status
│   └── routes/
│       ├── auth.js             # Register, login, forgot/reset password
│       ├── products.js         # Public product listings & single item queries
│       ├── orders.js           # Order creation, Razorpay order generation & verification
│       └── admin.js            # Admin metrics, stock management, order updates
│
├── deploy-vps/                 # Production deployment templates (Systemd, Nginx, Shell)
│   ├── deploy.sh               # One-click deployment script
│   ├── nginx/                  # Production Nginx reverse-proxy configuration
│   └── systemd/                # Systemd service configuration
├── Dockerfile                  # Container definition for containerized deployments
└── docker-compose.yml          # Multi-container orchestration (App + MongoDB)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas free tier cluster)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/anil7983/gourshal.git
cd gourshal
```

### 3. Backend Setup
Navigate into the `backend` directory and install dependencies:
```bash
cd backend
npm install
```

### 4. Configure Environment Variables
Copy the example configuration file:
```bash
cp .env.example .env
```

Open `.env` and fill in your configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gourshal
JWT_SECRET=your_super_secret_jwt_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000,http://127.0.0.1:5500
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FIRST_ADMIN_EMAIL=admin@gourshal.com
```

### 5. Seed the Database
Populate your database with the default authentic products (A2 Ghee, Mustard Oil, Spices, Herbal Teas, Coffee):
```bash
npm run seed
```

### 6. Start the Server
- **Development Mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The API server will listen on `http://localhost:5000`. You can serve the frontend with any static server (or Live Server in VS Code) at `http://localhost:5000` or port `5500`.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Create a new customer account | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Retrieve currently authenticated user profile | Yes |
| `POST` | `/api/auth/forgot-password` | Send password reset token | No |
| `POST` | `/api/auth/reset-password` | Reset password using verified token | No |

### Products (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/products` | Fetch all products (optional `category`, `search` filters) | No |
| `GET` | `/api/products/:id` | Fetch single product details with lab test data | No |
| `GET` | `/api/products/batch/:batchNumber` | Verify batch purity report & metrics | No |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/orders/create-razorpay-order` | Generate signed Razorpay payment order | Yes |
| `POST` | `/api/orders/verify-payment` | Verify signature & finalize database order | Yes |
| `GET` | `/api/orders/my-orders` | Fetch past orders for authenticated user | Yes |
| `GET` | `/api/orders/:id` | Retrieve specific order tracking details | Yes |

### Administration (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/admin/metrics` | Store statistics, total revenue & order counts | Admin |
| `GET` | `/api/admin/orders` | View & update all customer orders | Admin |
| `POST` | `/api/admin/products` | Add or update inventory stock & lab certificates | Admin |

---

## 🌐 Production Deployment

### Option 1: VPS with Nginx & PM2 (Recommended)
1. Use the provided configurations in `deploy-vps/`:
   ```bash
   sudo cp deploy-vps/nginx/gourshal.com.conf /etc/nginx/sites-available/gourshal
   sudo ln -s /etc/nginx/sites-available/gourshal /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
2. Start the backend with PM2:
   ```bash
   pm2 start backend/server.js --name gourshal
   pm2 save
   ```

### Option 2: Docker & Docker Compose
Run the entire stack (Node.js backend + MongoDB) in isolated containers:
```bash
docker-compose up -d --build
```

---

## 🔒 Security Best Practices

- **Never commit `.env` files**: All private API keys, MongoDB credentials, and JWT secrets must remain local or managed via environment secrets.
- **Production SSL**: Enforce HTTPS for all web traffic via Let's Encrypt / Certbot.
- **Strict CORS**: Limit `ALLOWED_ORIGINS` to your registered production domains.

---

## 📄 License & Legal Notice

Copyright © 2026 **M/S. GOURSHAL FOODS**. All rights reserved.  
Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
