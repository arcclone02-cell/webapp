# E-Market - Backend Setup Guide

## 📋 Project Structure

Your project now has both frontend (Angular) and backend (Node.js/Express) with MongoDB database.

```
e-market/
├── src/                 # Angular Frontend
│   ├── app/
│   │   ├── auth/       # Authentication
│   │   ├── home/       # Home page
│   │   ├── library/    # Library component (NEW)
│   │   └── ...
│   └── ...
├── backend/            # Node.js/Express Backend (NEW)
│   ├── models/         # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Purchase.js
│   │   └── Cart.js
│   ├── controllers/    # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── server.js       # Main server file
└── package.json        # Dependencies
```

## 🗄️ Database Collections

### 1. Users Collection
Stores user account information with password hashing (bcrypt)

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ('user' or 'admin'),
  avatar: String (optional),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Products Collection
Stores products created by users

```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  title: String,
  description: String,
  price: Number,
  image: String (URL),
  category: String ('art', 'photo', 'design', 'other'),
  status: String ('active', 'inactive', 'sold'),
  ratings: {
    average: Number,
    count: Number
  },
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Purchases Collection
Stores purchase history (what users bought)

```javascript
{
  _id: ObjectId,
  buyerId: ObjectId (reference to User),
  productId: ObjectId (reference to Product),
  sellerId: ObjectId (reference to User),
  productData: {
    title: String,
    price: Number,
    image: String,
    description: String
  },
  quantity: Number,
  totalPrice: Number,
  status: String ('pending', 'completed', 'cancelled', 'refunded'),
  paymentMethod: String,
  review: {
    rating: Number (1-5),
    comment: String,
    reviewedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Carts Collection
Stores shopping cart items

```javascript
{
  _id: ObjectId,
  userId: ObjectId (unique, reference to User),
  items: [
    {
      id: Number (Pexels photo ID),
      src: { large, medium, small },
      alt: String,
      photographer: String,
      url: String,
      price: Number,
      quantity: Number,
      addedAt: Date
    }
  ],
  totalPrice: Number,
  totalItems: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install
```

### Step 2: MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: brew install mongodb-community
# Linux: Follow MongoDB official documentation

# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

### Step 3: Environment Configuration

Create a `.env` file in the backend folder:

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit and update values:
MONGODB_URI=mongodb://localhost:27017/e-market
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:4200
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

### Step 4: Run the Application

#### Option A: Run Frontend & Backend Separately

Terminal 1 - Frontend:
```bash
npm start
# Runs on http://localhost:4200
```

Terminal 2 - Backend:
```bash
npm run server:dev
# Runs on http://localhost:3000
```

#### Option B: Run Both Together

```bash
npm run dev
# Runs both frontend and backend simultaneously
```

### Step 5: Test the Setup

1. Open http://localhost:4200
2. Register a new account
3. Login
4. Navigate to "Thư viện" (Library)
5. Create a new product
6. View your purchased items

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user (requires auth)

### Products (Your Items)

- `GET /api/products` - Get my products (requires auth)
- `POST /api/products` - Create product (requires auth)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Purchases (Bought Items)

- `GET /api/purchases/purchases` - Get my purchases (requires auth)
- `GET /api/purchases/sales` - Get my sales (requires auth)
- `POST /api/purchases` - Create purchase (requires auth)
- `PUT /api/purchases/:id/status` - Update purchase status (requires auth)
- `POST /api/purchases/:id/review` - Add review (requires auth)

### Cart

- `GET /api/cart` - Get cart (requires auth)
- `POST /api/cart/add` - Add item to cart (requires auth)
- `POST /api/cart/remove` - Remove item (requires auth)
- `POST /api/cart/clear` - Clear cart (requires auth)
- `POST /api/cart/update-quantity` - Update item quantity (requires auth)

## 🔐 Security Features

1. **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds)
2. **JWT Authentication**: Uses JSON Web Tokens for secure API access
3. **CORS Protection**: Backend has CORS configured to accept requests from frontend only
4. **Input Validation**: All inputs are validated before processing
5. **Authorization Checks**: Users can only modify their own products/purchases

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB service is running
```bash
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check that `CLIENT_URL` in `.env` matches your frontend URL

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change PORT in `.env` or kill the process using port 3000

### JWT Token Invalid
**Solution**: Make sure you're sending the token in Authorization header:
```
Authorization: Bearer <token>
```

## 📝 Development Workflow

### Adding a New Endpoint

1. Create controller function in `backend/controllers/`
2. Add route in `backend/routes/`
3. Add service method in frontend `src/app/*/service.ts`
4. Use the service in your component
5. Test with Postman or browser

### Example: Creating a Review Endpoint

**Backend Controller** (`backend/controllers/reviewController.js`):
```javascript
exports.createReview = async (req, res) => {
  // Implementation
};
```

**Backend Route** (`backend/routes/reviews.js`):
```javascript
router.post('/', authMiddleware, reviewController.createReview);
```

**Frontend Service** (`src/app/review/review.service.ts`):
```typescript
createReview(productId: string, review: any): Observable<any> {
  return this.http.post(`${environment.apiUrl}/reviews`, review);
}
```

**Frontend Component** (`src/app/review/review.component.ts`):
```typescript
this.reviewService.createReview(productId, formData).subscribe({
  next: (response) => { /* handle success */ },
  error: (error) => { /* handle error */ }
});
```

## 🧪 Testing API with Postman

1. Download Postman from https://www.postman.com/downloads/
2. Import the API collection (you can create one from the endpoints above)
3. Test each endpoint with sample data
4. Save responses as examples

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Angular Documentation](https://angular.io/docs)
- [JWT Guide](https://jwt.io/introduction)
- [Mongoose ODM](https://mongoosejs.com/)

## 🎯 Next Steps

1. ✅ Backend server is ready
2. ✅ Database models are defined
3. ✅ Library component with 2 tabs is created
4. ⏭️ Create purchase/checkout flow
5. ⏭️ Add product listing page
6. ⏭️ Add search and filtering
7. ⏭️ Implement payment gateway
8. ⏭️ Add email notifications
9. ⏭️ Deploy to production

## 💡 Tips

- Use MongoDB Compass for visual database management
- Use Postman for API testing before frontend integration
- Keep environment variables in `.env` and add it to `.gitignore`
- Regularly backup your MongoDB database
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add logging for debugging production issues

---

**Happy coding! 🚀**
