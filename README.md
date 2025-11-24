# 🏪 E-Market - Full Stack Application

> A modern e-commerce platform built with Angular, Node.js, Express, and MongoDB

## 📸 Overview

E-Market is a complete web application where users can:
- 🔐 Register and login securely with JWT authentication
- 📦 Create and manage their own digital products
- 🛍️ Browse and purchase products from other users
- 📚 Access personal library with 2 sections:
  - **"Sản phẩm của bạn"** (Your Products) - Products you created
  - **"Sản phẩm đã mua"** (Purchased Items) - Products you bought
- 🛒 Manage shopping cart
- ⭐ Review and rate products

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI

# 3. Initialize database (optional)
npm run db:setup

# 4. Run application
npm run dev
```

Access: http://localhost:4200

## 📁 Project Structure

```
e-market/
├── src/app/
│   ├── auth/          # Login/Register
│   ├── home/          # Browse products
│   ├── library/       # ⭐ NEW: 2-tab library view
│   └── ...
├── backend/           # ⭐ NEW: Node.js/Express API
│   ├── models/        # MongoDB schemas
│   ├── controllers/   # Business logic
│   ├── routes/        # API endpoints
│   └── server.js
├── package.json       # Updated with backend scripts
└── Guides...          # Setup documentation
```

## 🛠️ Tech Stack

**Frontend**: Angular 20, Material Design, TypeScript, RxJS
**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
**Database**: MongoDB (Local or Cloud Atlas)

## 📦 What's Included

✅ Complete backend API with 4 database collections
✅ Library component with product & purchase management
✅ Authentication system (JWT)
✅ Product CRUD operations
✅ Shopping cart functionality
✅ Responsive Material Design UI
✅ Error handling & validation
✅ Database initialization scripts

## 📡 API Endpoints

**Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`
**Products**: `/api/products` (CRUD)
**Purchases**: `/api/purchases/purchases`, `/api/purchases/sales`
**Cart**: `/api/cart/add`, `/api/cart/remove`, etc.

## 🔧 Available Commands

```bash
npm start              # Frontend development server
npm run server:dev     # Backend with auto-reload
npm run dev            # Both frontend & backend
npm run db:init        # Create database indexes
npm run db:seed        # Load sample data
npm run db:setup       # Complete database setup
```

## 📊 Database Collections

- **Users**: Authentication & user profiles
- **Products**: User-created products
- **Purchases**: Transaction history
- **Carts**: Shopping cart items

## 📚 Documentation

- **QUICKSTART.md** - Quick start guide
- **BACKEND_SETUP_GUIDE.md** - Detailed backend setup
- **WORK_COMPLETED.md** - Summary of completed work
- **MONGODB_MIGRATION_GUIDE.md** - Firebase migration notes

## 🧪 Test Accounts (after `npm run db:seed`)

```
Email: user1@example.com | Password: password123
Email: user2@example.com | Password: password123
Email: admin@example.com | Password: admin123
```

## 🔐 Security Features

- Passwords hashed with bcryptjs
- JWT token authentication
- CORS protection
- Input validation
- Authorization checks

## 🐛 Troubleshooting

**MongoDB won't connect?**
```bash
# Start MongoDB
mongod  # or: brew services start mongodb-community
```

**Port already in use?**
```bash
# Change PORT in backend/.env or kill the process
```

See detailed guides for more help.

## 📖 Learn More

Check the comprehensive guides included in the project:
- Setup instructions
- API documentation
- Database schema
- Deployment guide

---

**Last Updated**: November 24, 2025  
**Status**: ✅ Ready for development  
**Next Steps**: Implement checkout & payment integration

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
