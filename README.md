# E-Market - Hướng dẫn cài đặt

Một ứng dụng thương mại điện tử được xây dựng với **Angular** (frontend) và **Node.js/Express** (backend) kết hợp **MongoDB** cơ sở dữ liệu.

## 📋 Yêu cầu hệ thống

- **Node.js**: v18+ hoặc cao hơn
- **npm**: v9+ hoặc cao hơn
- **MongoDB**: v5+ hoặc cao hơn (hoặc MongoDB Atlas)
- **Git**: (tuỳ chọn)

## 🚀 Hướng dẫn cài đặt

### 1. Clone hoặc tải project

```bash
# Clone từ Git (nếu có)
git clone <repository-url>
cd e-market

# Hoặc tải file zip và giải nén vào thư mục e-market
```

### 2. Cài đặt dependencies

```bash
# Cài đặt các package cho cả frontend và backend
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục gốc của project:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-market

# Frontend
CLIENT_URL=http://localhost:4200

# Backend Server
PORT=3000
NODE_ENV=development

# Email Service (Gmail SMTP)
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# VNPayment Gateway
VNP_TMN_CODE=your_vnp_tmncode
VNP_HASH_SECRET=your_vnp_hashsecret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:4200/payment-success
VNP_API_URL=https://sandbox.vnpayment.vn/merchant_weblogic/merchant.html

# JWT Secret (tạo một chuỗi ngẫu nhiên)
JWT_SECRET=your_jwt_secret_key_here
```

**Lưu ý cấu hình:**
- Thay `username`, `password`, `cluster` với thông tin MongoDB của bạn
- Nếu dùng MongoDB local: `MONGODB_URI=mongodb://localhost:27017/e-market`
- Tạo JWT_SECRET mạnh (ví dụ: dùng công cụ online hoặc `openssl rand -base64 32`)

### 3.0 Setup MongoDB URI - File Cần Cấu Hình

**MONGODB_URI cần được setup ở những file sau:**

#### 1️⃣ **File `.env` (CHÍNH)** ← Start here!
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-market
```
Đây là file chính duy nhất bạn cần edit. Tất cả các file khác sẽ đọc từ đây.

#### 2️⃣ **backend/server.js** (Backend Server)
- **Vị trí:** [backend/server.js](backend/server.js#L21)
- **Cách dùng:** `mongoose.connect(process.env.MONGODB_URI)`
- **Nhiệm vụ:** Kết nối MongoDB khi chạy `npm run server` hoặc `npm run dev`
- **Cần làm:** ✅ KHÔNG - chỉ cần cấu hình `.env`

#### 3️⃣ **Database Setup Scripts** (Optional - chỉ chạy 1 lần)
Những file này tự động đọc từ `.env`:

| Script | Lệnh | Chức Năng |
|--------|------|----------|
| [initializeDB.js](backend/scripts/initializeDB.js) | `npm run db:init` | Khởi tạo schema database |
| [setupDatabase.js](backend/scripts/setupDatabase.js) | `npm run db:setup` | Setup + seed dữ liệu |
| [seedDatabase.js](backend/scripts/seedDatabase.js) | `npm run db:seed` | Thêm dữ liệu mẫu |
| [seedFreeProducts.js](backend/scripts/seedFreeProducts.js) | `npm run db:seed-free` | Thêm sản phẩm miễn phí |
| [resetDatabase.js](backend/scripts/resetDatabase.js) | `npm run db:reset` | Xoá toàn bộ dữ liệu |

**Cần làm:** ✅ KHÔNG - tất cả đều tự động đọc từ `.env`

#### 🎯 **Quy Trình Setup Đúng Cách:**

```bash
# Bước 1: Tạo file .env ở thư mục gốc (ngang hàng với package.json)
cp .env.example .env

# Bước 2: Mở file .env và cập nhật MONGODB_URI
nano .env
# Thay thế dòng này:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/e-market
# Với MongoDB URI thực tế của bạn

# Bước 3: Kiểm tra kết nối
npm run db:check
# Nếu thấy ✅ Connected to MongoDB, bạn đã setup đúng!

# Bước 4: Khởi tạo database (chạy 1 lần)
npm run db:setup

# Bước 5: Chạy ứng dụng
npm run dev
```

#### 📋 **Danh Sách Hoàn Chỉnh - Những File Sử Dụng MongoDB:**

```
✅ .env (Main config - cần cấu hình)
│
├─ backend/
│  ├─ server.js ........................ Đọc từ process.env.MONGODB_URI
│  ├─ models/
│  │  ├─ User.js ....................... Schema user
│  │  ├─ Product.js .................... Schema sản phẩm
│  │  ├─ Cart.js ....................... Schema giỏ hàng
│  │  └─ Purchase.js ................... Schema đơn hàng
│  ├─ scripts/
│  │  ├─ initializeDB.js ............... Đọc từ process.env.MONGODB_URI
│  │  ├─ setupDatabase.js .............. Đọc từ process.env.MONGODB_URI
│  │  ├─ seedDatabase.js ............... Đọc từ process.env.MONGODB_URI
│  │  ├─ seedFreeProducts.js ........... Đọc từ process.env.MONGODB_URI
│  │  └─ resetDatabase.js .............. Đọc từ process.env.MONGODB_URI
│  └─ controllers/
│     ├─ authController.js ............. Dùng MongoDB thông qua models
│     ├─ productController.js .......... Dùng MongoDB thông qua models
│     └─ cartController.js ............ Dùng MongoDB thông qua models
│
└─ src/app/ ............................ Frontend (không kết nối MongoDB trực tiếp)
   └─ _helpers/
      └─ backend.ts ................... Gọi API backend (backend là trung gian)
```

#### 🔍 **Kiểm Tra Kết Nối MongoDB**

```bash
# Chạy lệnh check
npm run db:check

# Kết quả thành công:
# ✅ MongoDB connected successfully
# Database: e-market
# Users count: 5
```

Nếu thất bại, kiểm tra:
- ✅ MONGODB_URI trong `.env` có chính xác không?
- ✅ Đó là URL MongoDB Atlas hay MongoDB local?
- ✅ Tài khoản/IP whitelist đã được cấu hình?
- ✅ Internet connection có ổn không?

### 3a. Cấu hình Gmail SMTP Email Service

**Bước 1: Bật 2-Factor Authentication trên Google Account**
1. Truy cập: https://myaccount.google.com/security
2. Tìm mục "2-Step Verification" và bật nó
3. Xác thực bằng số điện thoại

**Bước 2: Tạo App Password**
1. Quay lại https://myaccount.google.com/security
2. Tìm mục "App passwords" (sẽ xuất hiện sau khi bật 2FA)
3. Chọn "Mail" và "Windows Computer" (hoặc thiết bị của bạn)
4. Google sẽ tạo một password 16 ký tự
5. Copy password này vào `.env`:
   ```env
   EMAIL_FROM=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

**Bước 3: Cấp quyền SMTP**
- Truy cập: https://myaccount.google.com/lesssecureapps
- Bật "Allow less secure app access" (nếu cần)

💡 **Lưu ý:** Google không khuyến nghị sử dụng "less secure apps", nên cách App Password là an toàn nhất.

### 3b. Cấu hình VNPayment Gateway

**Bước 1: Đăng ký tài khoản VNPayment**
1. Truy cập: https://sandbox.vnpayment.vn (môi trường test)
2. Hoặc: https://www.vnpayment.vn (môi trường production)
3. Đăng ký tài khoản merchant
4. Xác thực email và số điện thoại

**Bước 2: Lấy TMN Code và Hash Secret**
1. Đăng nhập vào tài khoản VNPayment
2. Vào mục "Cài đặt website" hoặc "Integration Settings"
3. Tìm:
   - **Mã website (TMN Code)**: VD: `2QXXX1609` - copy vào `VNP_TMN_CODE`
   - **Hash Secret / Secure Hash Secret**: VD: `XXXXXXXXXXXXXXXX` - copy vào `VNP_HASH_SECRET`
4. Đảm bảo tên miền/localhost được thêm vào danh sách được phép

**Bước 3: Cấu hình URL Return**
1. Trong tài khoản VNPayment, cấu hình:
   - **Return URL**: `http://localhost:4200/payment-success` (hoặc domain của bạn)
   - **Notify URL**: `http://localhost:3000/api/payments/ipn` (IPN callback)

**Bước 4: Cập nhật file .env**
```env
VNP_TMN_CODE=2QXXX1609
VNP_HASH_SECRET=XXXXXXXXXXXXXXXX
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:4200/payment-success
VNP_API_URL=https://sandbox.vnpayment.vn/merchant_weblogic/merchant.html
```

**Chuyển sang Production:**
- Thay `sandbox.vnpayment.vn` → `www.vnpayment.vn`
- Lấy TMN Code và Hash Secret mới từ môi trường production
- Cập nhật domain thực tế của bạn thay vì localhost

**Test VNPayment (Sandbox):**
- Số thẻ test: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày hết hạn: `07/15`
- OTP: `123456`

**Kiểm tra kết nối:**
```bash
# Sau khi cấu hình, hãy test thanh toán
npm run dev
# Truy cập: http://localhost:4200
# Thêm sản phẩm vào giỏ hàng
# Click thanh toán và test với số thẻ trên
```

### 4. Khởi tạo và seed dữ liệu (tùy chọn)

```bash
# Khởi tạo database schema
npm run db:init

# Seed dữ liệu mẫu
npm run db:seed

# Hoặc setup và seed một lần
npm run db:setup

# Kiểm tra users trong database
npm run db:check

# Seed các sản phẩm miễn phí
npm run db:seed-free

# Reset database (xoá toàn bộ dữ liệu)
npm run db:reset
```

## ▶️ Chạy ứng dụng

### Option 1: Chạy cùng lúc Frontend + Backend (khuyến nghị)

```bash
npm run dev
```

Lệnh này sẽ chạy:
- **Frontend**: Angular Dev Server tại `http://localhost:4200`
- **Backend**: Express Server tại `http://localhost:3000`

### Option 2: Chạy riêng

**Chạy Frontend:**
```bash
npm start
# Frontend sẽ mở tại http://localhost:4200
```

**Chạy Backend (terminal khác):**
```bash
npm run server:dev
# Backend sẽ chạy tại http://localhost:3000
```

### Option 3: Chạy Backend mà không có auto-reload

```bash
npm run server
```

## 🧪 Chạy tests

```bash
# Chạy Angular unit tests
npm test
```

## 🏗️ Build for Production

```bash
# Build Angular app
npm run build

# Kết quả output sẽ ở thư mục dist/
```

## 📁 Cấu trúc project

```
e-market/
├── src/                          # Frontend (Angular)
│   ├── app/
│   │   ├── auth/                # Authentication & Login
│   │   ├── cart/                # Shopping Cart
│   │   ├── home/                # Home Page
│   │   ├── library/             # Products Library
│   │   ├── payment/             # Payment Processing
│   │   ├── profile/             # User Profile
│   │   ├── components/          # Reusable Components
│   │   ├── _helpers/            # Services & Guards
│   │   └── app-routing.module.ts
│   └── assets/                  # Static Assets
│
├── backend/                      # Backend (Node.js/Express)
│   ├── controllers/             # Business Logic
│   ├── models/                  # MongoDB Schemas
│   ├── routes/                  # API Routes
│   ├── middleware/              # Custom Middleware
│   ├── services/                # Utilities (Email, etc)
│   ├── scripts/                 # Database Scripts
│   └── server.js                # Entry Point
│
├── public/                       # Static Public Files
├── package.json                 # Dependencies & Scripts
├── angular.json                 # Angular Configuration
├── tsconfig.json                # TypeScript Configuration
└── .env                         # Environment Variables (tạo file này)
```

## 🔧 API Endpoints

Backend cung cấp các endpoint API chính:

```
POST   /api/auth/register        - Đăng ký tài khoản
POST   /api/auth/login           - Đăng nhập
POST   /api/auth/reset-password  - Đặt lại mật khẩu

GET    /api/products             - Lấy danh sách sản phẩm
GET    /api/products/:id         - Chi tiết sản phẩm
POST   /api/products             - Tạo sản phẩm (admin)
PUT    /api/products/:id         - Cập nhật sản phẩm (admin)
DELETE /api/products/:id         - Xoá sản phẩm (admin)

GET    /api/cart                 - Lấy giỏ hàng
POST   /api/cart/add             - Thêm sản phẩm vào giỏ
DELETE /api/cart/remove/:id      - Xoá sản phẩm khỏi giỏ

POST   /api/payments/create      - Tạo thanh toán
POST   /api/purchases            - Tạo đơn hàng

GET    /api/profile              - Lấy thông tin user
PUT    /api/profile              - Cập nhật thông tin user
```

## 🐛 Troubleshooting

### Port 3000 hoặc 4200 đã được sử dụng

```bash
# Thay đổi port backend trong .env
PORT=3001

# Hoặc frontend
ng serve --port 4300
```

### Lỗi kết nối MongoDB

- Kiểm tra `MONGODB_URI` trong `.env`
- Đảm bảo MongoDB service đang chạy
- Kiểm tra kết nối internet nếu dùng MongoDB Atlas
- Kiểm tra IP whitelist trong MongoDB Atlas

### Lỗi CORS

- Đảm bảo `CLIENT_URL` trong `.env` khớp với URL frontend
- Mặc định: `http://localhost:4200`

### Dependencies không cài được

```bash
# Xoá node_modules và package-lock.json
rm -r node_modules package-lock.json
# Hoặc trên Windows:
rmdir /s node_modules
del package-lock.json

# Cài lại
npm install
```

## 📚 Thư viện chính

### Frontend
- **Angular 20.x** - Framework
- **Angular Material** - UI Components
- **Axios** - HTTP Client
- **RxJS** - Reactive Programming

### Backend
- **Express 5.x** - Web Framework
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password Hashing
- **JWT** - Authentication
- **Nodemon** - Auto-reload (dev)

## 👥 Tài khoản test (mẫu sau khi seed)

```
Email: test@example.com
Password: password123
```

## 📞 Hỗ trợ

Nếu có vấn đề trong quá trình cài đặt, hãy:
1. Kiểm tra lại file `.env`
2. Xoá `node_modules` và cài lại
3. Đảm bảo MongoDB đang kết nối
4. Kiểm tra phiên bản Node.js: `node --version`

## 📄 License

Dự án này được cấp phép theo MIT License.
