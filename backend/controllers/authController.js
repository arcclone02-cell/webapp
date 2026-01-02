const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRE = '7d';

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp tên, email và mật khẩu',
        errorCode: 'MISSING_FIELDS'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Email không hợp lệ',
        errorCode: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
        errorCode: 'PASSWORD_TOO_SHORT'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.',
        errorCode: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    // Validation error
    if (error.name === 'ValidationError') {
      return res.status(422).json({ 
        message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    // Default server error
    res.status(500).json({ 
      message: 'Lỗi đăng ký. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email và mật khẩu',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    // Find user and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Email hoặc mật khẩu không chính xác',
        errorCode: 'INVALID_EMAIL'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        message: 'Email hoặc mật khẩu không chính xác',
        errorCode: 'INVALID_PASSWORD'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    // Default server error
    res.status(500).json({ 
      message: 'Lỗi đăng nhập. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Forgot Password
// Generate temporary password (8 characters)
const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Forgot Password - Generate and send new password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email',
        errorCode: 'MISSING_EMAIL'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Email này không được đăng ký trong hệ thống',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Generate new password (8 characters)
    const newPassword = generateTemporaryPassword();

    // Update user password with plain text - middleware sẽ tự động hash
    user.password = newPassword;
    await user.save();

    console.log('✅ New password saved to database for:', email);

    // Send new password via email (plain text)
    try {
      await emailService.sendTemporaryPassword(email, newPassword);
      console.log('✅ New password email sent successfully to:', email);
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      console.log('📧 New password (for development):', newPassword);
      // Trong chế độ development, không throw error nếu email thất bại
      // Mật khẩu mới đã được lưu vào database
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          message: 'Lỗi khi gửi email. Vui lòng thử lại sau.',
          errorCode: 'EMAIL_SEND_ERROR',
          error: emailError.message 
        });
      }
    }

    res.status(200).json({
      message: 'Mật khẩu mới đã được tạo và gửi tới email của bạn. Hãy đăng nhập với mật khẩu mới này.'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Lỗi khôi phục mật khẩu. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Find user with matching token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check if token matches and hasn't expired
    if (user.passwordResetToken !== token) {
      return res.status(400).json({ message: 'Token không hợp lệ' });
    }

    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({ message: 'Token đã hết hạn' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};

// Generate OTP (6 digits)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Verification OTP
exports.sendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email',
        errorCode: 'MISSING_EMAIL'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Email này không được đăng ký trong hệ thống',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check if email already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Email này đã được xác thực',
        errorCode: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Generate OTP (6 digits)
    const otp = generateOtp();

    // Save OTP to database (expires in 10 minutes)
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    try {
      await emailService.sendVerificationOtp(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ 
        message: 'Lỗi khi gửi mã OTP. Vui lòng thử lại sau.',
        errorCode: 'EMAIL_SEND_ERROR',
        error: emailError.message 
      });
    }

    res.status(200).json({
      message: 'Mã OTP đã được gửi tới email của bạn. Mã sẽ hết hạn sau 10 phút.'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Lỗi gửi mã OTP. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email và mã OTP',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Không tìm thấy người dùng',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Check if OTP is correct
    if (user.verificationOtp !== otp) {
      return res.status(400).json({ 
        message: 'Mã OTP không chính xác',
        errorCode: 'INVALID_OTP'
      });
    }

    // Check if OTP has expired
    if (new Date() > user.verificationOtpExpires) {
      return res.status(400).json({ 
        message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
        errorCode: 'OTP_EXPIRED'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, user.email);

    res.status(200).json({
      message: 'Email xác thực thành công',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Lỗi xác thực OTP. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp email',
        errorCode: 'MISSING_EMAIL'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'Không tìm thấy người dùng',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Email này đã được xác thực',
        errorCode: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Generate new OTP
    const otp = generateOtp();

    // Save OTP to database (expires in 10 minutes)
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP email
    try {
      await emailService.sendVerificationOtp(email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({ 
        message: 'Lỗi khi gửi mã OTP. Vui lòng thử lại sau.',
        errorCode: 'EMAIL_SEND_ERROR',
        error: emailError.message 
      });
    }

    res.status(200).json({
      message: 'Mã OTP mới đã được gửi. Mã sẽ hết hạn sau 10 phút.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    
    // Network or connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      return res.status(500).json({ 
        message: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.',
        errorCode: 'DB_CONNECTION_ERROR'
      });
    }

    res.status(500).json({ 
      message: 'Lỗi gửi lại mã OTP. Vui lòng thử lại sau.',
      errorCode: 'SERVER_ERROR',
      error: error.message 
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    console.log('🔐 Change password request for user:', userId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    console.log('📝 User found:', user.email);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      console.log('❌ Current password incorrect for user:', user.email);
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    console.log('✅ Current password verified');

    // Check if new password is same as current password
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      console.log('⚠️ New password is same as current password for user:', user.email);
      return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' });
    }

    // Update password (middleware will hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ New password saved to database for user:', user.email);

    res.status(200).json({
      message: 'Mật khẩu đã được thay đổi thành công'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Lỗi', error: error.message });
  }
};
