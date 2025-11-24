# Database Setup Guide - E-Market Trading Cards

## Overview
Database này được thiết kế cho ứng dụng trading cards marketplace với 4 collections chính:
- **Users**: Quản lý tài khoản người dùng
- **Products**: Lưu trữ thẻ trading card được bán
- **Purchases**: Ghi nhận giao dịch mua bán
- **Carts**: Giỏ hàng của người dùng

---

## Database Setup

### Step 1: Cài đặt MongoDB
Nếu chưa cài MongoDB, hãy tải từ: https://www.mongodb.com/try/download/community

**Windows:**
```bash
# Sử dụng MongoDB Community Edition
mongod
```

**macOS (với Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Cấu hình .env
Tạo file `backend/.env` nếu chưa có:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/e-market

# Server Port
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# Node Environment
NODE_ENV=development
```

### Step 3: Cài đặt Dependencies
```bash
npm install
```

### Step 4: Khởi tạo Database
Có 2 cách để setup database:

#### Option A: Full Setup (Tạo + Seed Data)
```bash
npm run db:setup
```
Lệnh này sẽ:
- ✅ Tạo tất cả collections
- ✅ Tạo indexes
- ✅ Thêm sample data
- ✅ Hiển thị thông tin database

#### Option B: Chỉ tạo Collections (Không Seed)
```bash
npm run db:init
```

### Step 5: Xác minh Database
```bash
# Khởi động backend
npm run server:dev

# Hoặc chạy cả frontend và backend
npm run dev
```

---

## Collections Schema

### 1. Users Collection
Lưu trữ thông tin người dùng:

```json
{
  "_id": ObjectId,
  "name": "John Collector",
  "email": "collector@example.com",
  "password": "hashed_password",
  "role": "user",
  "avatar": "https://...",
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

**Indexes:**
- `email` (unique)
- `createdAt`

**Sample Test Accounts:**
```
Email: collector1@example.com
Password: Password123!

Email: seller@example.com
Password: Password123!

Email: trader@example.com
Password: Password123!

Email: admin@example.com
Password: Admin123!
```

---

### 2. Products Collection
Quản lý thẻ trading card:

```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "title": "Pokemon Base Set Charizard",
  "description": "Rare holographic card...",
  "price": 450000,
  "image": "https://...",
  "category": "pokemon",
  "status": "active",
  "viewCount": 156,
  "rating": 4.8,
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

**Categories:**
- `pokemon` - Pokémon Trading Cards
- `yugioh` - Yu-Gi-Oh Cards
- `magic` - Magic The Gathering
- `digimon` - Digimon Cards
- `onepiece` - One Piece Cards
- `sports` - Sports Cards
- `other` - Khác

**Status:**
- `active` - Đang bán
- `sold` - Đã bán
- `inactive` - Tạm ngưng

**Indexes:**
- `userId`
- `category`
- `status`
- `createdAt`

---

### 3. Purchases Collection
Ghi nhận giao dịch mua bán:

```json
{
  "_id": ObjectId,
  "buyerId": ObjectId,
  "sellerId": ObjectId,
  "productId": ObjectId,
  "productData": {
    "title": "...",
    "price": 450000,
    "image": "https://..."
  },
  "quantity": 1,
  "totalPrice": 450000,
  "status": "completed",
  "paymentMethod": "credit_card",
  "review": {
    "rating": 5,
    "comment": "Great seller!",
    "reviewer": ObjectId
  },
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

**Status:**
- `pending` - Đang chờ thanh toán
- `completed` - Hoàn tất
- `cancelled` - Bị hủy
- `refunded` - Đã hoàn tiền

**Payment Methods:**
- `credit_card` - Thẻ tín dụng
- `bank_transfer` - Chuyển khoản
- `digital_wallet` - Ví điện tử
- `cash` - Tiền mặt

**Indexes:**
- `buyerId`
- `sellerId`
- `productId`
- `createdAt`

---

### 4. Carts Collection
Giỏ hàng của người dùng:

```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "items": [
    {
      "productId": ObjectId,
      "quantity": 1,
      "price": 450000
    }
  ],
  "totalPrice": 450000,
  "totalItems": 1,
  "createdAt": "2025-11-24T...",
  "updatedAt": "2025-11-24T..."
}
```

**Indexes:**
- `userId` (unique)

---

## API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/current-user
POST   /api/auth/forgot-password
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/user/:userId
```

### Purchases
```
GET    /api/purchases
POST   /api/purchases
GET    /api/purchases/:id
POST   /api/purchases/:id/review
GET    /api/sales (Các sản phẩm đã bán)
```

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update/:productId
DELETE /api/cart/remove/:productId
DELETE /api/cart/clear
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp:**
1. Kiểm tra MongoDB đã khởi động: `mongod`
2. Kiểm tra `MONGODB_URI` trong `.env`
3. Đảm bảo cổng 27017 không bị chặn

### Duplicate Key Error
```
MongoError: E11000 duplicate key error
```
**Giải pháp:**
```bash
# Xóa index bị trùng
db.users.dropIndex("email_1")

# Hoặc reset database
npm run db:setup
```

### Permission Denied
```
Error: permission denied on 'e-market' to user
```
**Giải pháp:**
1. Xóa dòng authentication từ `MONGODB_URI`
2. Hoặc cấu hình MongoDB với authentication đúng

---

## Maintenance Commands

```bash
# Khởi tạo database và seed data
npm run db:setup

# Chỉ khởi tạo collections (không seed)
npm run db:init

# Backup database
mongoexport -d e-market -c products -o products.json

# Restore database
mongoimport -d e-market -c products products.json

# Xóa database
mongo e-market --eval "db.dropDatabase()"
```

---

## Monitoring & Inspection

### MongoDB Compass
Sử dụng GUI để quản lý database:
1. Download: https://www.mongodb.com/products/compass
2. Kết nối: `mongodb://localhost:27017`
3. Duyệt collections, documents, indexes

### MongoDB CLI
```bash
# Kết nối đến database
mongo

# Chọn database
use e-market

# Xem collections
show collections

# Xem documents
db.users.find()

# Xem indexes
db.products.getIndexes()

# Xóa collection
db.users.drop()
```

---

## Best Practices

✅ **Do's:**
- Luôn sử dụng `.env` để cấu hình
- Backup database thường xuyên
- Sử dụng indexes cho queries phổ biến
- Validate dữ liệu trước khi lưu
- Hash password trước khi lưu

❌ **Don'ts:**
- Không để MongoDB chạy root
- Không lưu password dưới dạng plain text
- Không query lớn mà không pagination
- Không xóa collections ngẫu nhiên
- Không hardcode credentials trong code

---

## Support
Nếu gặp vấn đề:
1. Kiểm tra `backend/logs` nếu có
2. Chạy `npm run db:setup` để reset
3. Kiểm tra MongoDB connection string
4. Xem console output khi chạy server

---

**Last Updated:** November 24, 2025
**Version:** 1.0.0
