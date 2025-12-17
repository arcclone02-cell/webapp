const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Gửi mật khẩu mới
exports.sendTemporaryPassword = async (email, temporaryPassword) => {
  try {
    // Kiểm tra SMTP config
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️ SMTP không được cấu hình. Email sẽ được in ra console.');
      console.log(`\n${'='.repeat(60)}`);
      console.log('📧 EMAIL MẬT KHẨU MỚI');
      console.log(`${'='.repeat(60)}`);
      console.log(`TO: ${email}`);
      console.log(`NEW PASSWORD: ${temporaryPassword}`);
      console.log(`${'='.repeat(60)}\n`);
      return true;
    }

    const transporter = createTransporter();
    
    // HTML template cho email
    const htmlTemplate = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 24px;">🔐 Mật khẩu mới của bạn</h2>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
            Chào bạn,
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản E-Market. Dưới đây là <strong>mật khẩu mới</strong> của bạn:
          </p>
          
          <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 6px;">
            <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Mật khẩu mới:</p>
            <p style="color: #667eea; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px; font-family: 'Courier New', monospace;">
              ${temporaryPassword}
            </p>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #856404; font-size: 13px; margin: 0; font-weight: bold;">⚠️ Hướng dẫn sử dụng:</p>
            <ul style="color: #856404; font-size: 13px; margin: 10px 0 0 0; padding-left: 20px;">
              <li>Copy mật khẩu mới ở trên</li>
              <li>Đăng nhập với email và mật khẩu mới này</li>
              <li>Sau khi đăng nhập thành công, bạn có thể thay đổi mật khẩu trong "Cài đặt" nếu muốn</li>
              <li>Mật khẩu cũ không còn hoạt động nữa</li>
            </ul>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #666; font-size: 13px; line-height: 1.6;">
            <strong>🔒 Bảo mật:</strong>
          </p>
          <ul style="color: #666; font-size: 13px; line-height: 1.8; margin: 10px 0;">
            <li>Không chia sẻ mật khẩu này cho bất kỳ ai</li>
            <li>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này</li>
            <li>Mật khẩu này là mật khẩu chính thức của tài khoản của bạn</li>
          </ul>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            Đây là email tự động từ E-Market. Vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    `;

    // Gửi email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '🔐 Mật khẩu mới E-Market',
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ New password email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending password email:', error.message);
    throw error;
  }
};

// Gửi email xác nhận đăng ký
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const htmlTemplate = `
      <h2>Chào mừng ${name}!</h2>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên E-Market.</p>
      <p>Tài khoản của bạn đã được tạo thành công và sẵn sàng sử dụng.</p>
      <p>Bạn có thể bắt đầu khám phá và mua sắm các sản phẩm yêu thích.</p>
      <hr/>
      <p style="color: #666; font-size: 12px;">Đây là email tự động, vui lòng không trả lời email này.</p>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Chào mừng đến E-Market!',
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Gửi OTP xác thực email
exports.sendVerificationOtp = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const htmlTemplate = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Xác thực email của bạn</h2>
        <p style="color: #666; font-size: 14px;">Cảm ơn bạn đã đăng ký tài khoản E-Market.</p>
        <p style="color: #666; font-size: 14px;">Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng mã OTP dưới đây:</p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="color: white; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Mã OTP của bạn:</p>
          <p style="color: white; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 5px;">${otp}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Mã OTP này sẽ hết hạn sau <strong>10 phút</strong>.</p>
        <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Đây là email tự động từ E-Market, vui lòng không trả lời email này.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Mã xác thực email E-Market',
      html: htmlTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};
