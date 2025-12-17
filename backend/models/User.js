const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên'],
      trim: true,
      maxlength: [50, 'Tên không được vượt quá 50 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Vui lòng cung cấp email hợp lệ']
    },
    password: {
      type: String,
      required: [true, 'Vui lòng cung cấp mật khẩu'],
      minlength: 6,
      select: false // Không lấy password theo mặc định
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Password reset fields
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Email verification OTP fields
    verificationOtp: String,
    verificationOtpExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: Date
  },
  {
    timestamps: true // Tự động thêm createdAt và updatedAt
  }
);

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó bị thay đổi
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
