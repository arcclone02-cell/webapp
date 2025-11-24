# Firebase to MongoDB Migration Guide

## Overview
This project has been successfully migrated from Firebase to MongoDB. The frontend Angular application now communicates with your MongoDB backend via REST API endpoints.

## Changes Made

### 1. **Dependencies Updated**
- Removed: `@angular/fire` package
- Added: `axios` for HTTP requests (already using Angular's HttpClient)

### 2. **Environment Configuration**
**Before (Firebase):**
```typescript
apiUrl: '',
firebase: { ... }
```

**After (MongoDB):**
```typescript
apiUrl: 'http://localhost:3000/api' // Development
apiUrl: 'https://api.example.com/api' // Production
```

### 3. **Authentication Service**
- Replaced Firebase Auth with REST API calls
- Token-based authentication (JWT)
- User stored in localStorage instead of Firebase
- All auth operations now use HTTP POST requests

**Key Methods:**
- `login(email, password)` - POST `/auth/login`
- `register(name, email, password)` - POST `/auth/register`
- `forgotPassword(email)` - POST `/auth/forgot-password`
- `logout()` - Clears localStorage and state
- `getUserId()` - Returns user ID from localStorage

### 4. **Auth Guard**
- Simplified to check localStorage for current user token
- No longer uses observables (synchronous check)
- Redirects to login if not authenticated

### 5. **Home Component (Cart Management)**
- Replaced Firestore document operations with MongoDB REST API
- Cart items now sent to: POST `/cart/add`
- Requires Bearer token in Authorization header

### 6. **Module Cleanup**
- Removed AngularFireModule, AngularFireAuthModule, AngularFirestoreModule
- Kept only HttpClientModule for API communication

## Required MongoDB Backend API Endpoints

Your Node.js/Express backend should implement these endpoints:

### Authentication Endpoints

#### POST `/api/auth/register`
**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "mongo_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-11-24T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "mongo_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-11-24T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

### Cart Endpoints

#### POST `/api/cart/add`
**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "item": {
    "id": 123,
    "src": { "large": "url", "medium": "url", "small": "url" },
    "alt": "description",
    "photographer": "name",
    "url": "pexels_url",
    "price": 150,
    "addedAt": "2024-11-24T00:00:00.000Z"
  }
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cart": { ... }
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Update API URL
Update `src/environments/environment.ts` with your MongoDB backend URL:
```typescript
apiUrl: 'http://localhost:3000/api'
```

### 3. Start the Application
```bash
npm start
```

The app will run on `http://localhost:4200`

## Database Schema (Recommended)

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String, // 'user', 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Carts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to Users),
  items: [
    {
      id: Number,
      src: { large, medium, small },
      alt: String,
      photographer: String,
      url: String,
      price: Number,
      addedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **Password Hashing**: Use bcrypt to hash passwords before storing
2. **JWT Secret**: Store JWT secret in environment variables, not in code
3. **CORS**: Configure CORS properly on backend to allow requests from your frontend domain
4. **HTTPS**: Use HTTPS in production
5. **Input Validation**: Validate all inputs on the backend
6. **Rate Limiting**: Implement rate limiting for authentication endpoints

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Add CORS middleware to your Express backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200' // Update for production
}));
```

### Issue: Token Expired
**Solution:** Implement token refresh endpoint or show re-login prompt when 401 is received

### Issue: Lost Cart Data
**Solution:** Ensure cart items are properly saved to MongoDB before redirecting

## Next Steps

1. Create a Node.js/Express backend with MongoDB
2. Implement all required API endpoints from the section above
3. Set up JWT authentication on the backend
4. Configure MongoDB connection and schemas
5. Test all authentication flows
6. Test cart add/update operations
7. Deploy both frontend and backend

## Support Files

- **Auth Service**: `src/app/auth/auth.service.ts`
- **Auth Guard**: `src/app/auth/auth.guard.ts`
- **Home Component**: `src/app/home/home.component.ts`
- **Environment Config**: `src/environments/environment.ts`
