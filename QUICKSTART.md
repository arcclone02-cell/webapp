# 🚀 Quick Start Guide

## What's New?

✅ **Backend Server**: Node.js/Express API with MongoDB
✅ **Library Component**: Two tabs - "Sản phẩm của bạn" (Your Products) & "Sản phẩm đã mua" (Purchased Items)
✅ **Database Models**: User, Product, Purchase, Cart collections
✅ **Authentication**: JWT-based API authentication

## 📦 Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB

**Option A - Local MongoDB:**
- Download from: https://www.mongodb.com/try/download/community
- Install and start the service

**Option B - Cloud (MongoDB Atlas):**
- Go to: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string

### 3. Create Backend Configuration

```bash
# In the backend folder, create .env file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/e-market
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:4200
JWT_SECRET=your_secret_key_here
```

## ▶️ Run the Application

### Option 1: Run Both (Recommended)
```bash
npm run dev
```

### Option 2: Run Separately

Terminal 1:
```bash
npm start
```

Terminal 2:
```bash
npm run server:dev
```

## 🎯 Test the Features

1. **Register Account**
   - Go to http://localhost:4200
   - Click "Đăng ký" and create account

2. **Login**
   - Login with your credentials

3. **Navigate to Library**
   - Click "Thư viện" in the toolbar

4. **Create a Product**
   - Click "Tạo sản phẩm mới"
   - Fill in the form:
     - Tên sản phẩm (Product Name)
     - Mô tả (Description)
     - Giá (Price in VND)
     - URL hình ảnh (Image URL)
     - Danh mục (Category)
     - Trạng thái (Status)
   - Click "Tạo mới"

5. **View Your Products**
   - See your created products in Tab 1

6. **View Purchases**
   - Tab 2 shows items you've bought (will be empty initially)

## 📁 Project Structure

```
e-market/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # API logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # JWT auth
│   ├── server.js        # Main server
│   └── .env             # Environment variables
├── src/
│   ├── app/
│   │   ├── library/     # ✨ NEW: Library component
│   │   ├── auth/        # Login/Register
│   │   ├── home/        # Home page
│   │   └── app-routing.module.ts  # Routes updated
│   └── ...
├── package.json         # Updated with backend deps
└── README files         # Setup guides
```

## 🔑 Key Files to Know

### Frontend
- `src/app/library/library.component.ts` - Main library page
- `src/app/library/library.service.ts` - API calls for products & purchases
- `src/app/app-routing.module.ts` - Routes (library added)
- `src/app/app.component.ts` - Navbar with library link

### Backend
- `backend/server.js` - Express server entry point
- `backend/models/` - Database schemas
- `backend/controllers/` - Business logic
- `backend/routes/` - API endpoints

## 🔗 API Endpoints (Backend)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### Products
- `GET /api/products` - Your products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Purchases
- `GET /api/purchases/purchases` - Your purchases
- `GET /api/purchases/sales` - Your sales
- `POST /api/purchases` - Create purchase

## 🛠️ Common Issues

### MongoDB Won't Connect
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port 3000 Already Used
Edit `backend/.env` and change `PORT=3001`

### CORS Error
Make sure `backend/.env` has: `CLIENT_URL=http://localhost:4200`

## 📚 Learn More

- **Backend Guide**: See `BACKEND_SETUP_GUIDE.md`
- **Migration Guide**: See `MONGODB_MIGRATION_GUIDE.md`
- **API Docs**: All endpoints documented in guides above

## ✨ What's Working

✅ User registration & login with JWT tokens
✅ Create, read, update, delete products
✅ View your created products
✅ View purchased items
✅ Add to cart
✅ Protected routes (require login)
✅ Responsive UI with Material Design

## 🎓 Next Features to Implement

- [ ] Complete purchase flow
- [ ] Add product reviews & ratings
- [ ] Product search & filtering
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Seller statistics
- [ ] Product recommendations

## 🤝 Need Help?

Check the detailed guides:
- `BACKEND_SETUP_GUIDE.md` - Full backend documentation
- `MONGODB_MIGRATION_GUIDE.md` - Firebase to MongoDB migration notes

---

**Happy building! 🎉**

**Questions?** Check the guides or review the code comments!
