import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

interface FormValidation {
  isValid: boolean;
  message: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AuthComponent {
  email = '';
  password = '';
  name = '';
  isLoginMode = true;
  loading = false;
  error = '';
  errorType: 'error' | 'warning' | 'info' = 'error';
  showForgotPassword = false;
  forgotEmail = '';
  forgotMessage = '';
  // OTP verification fields
  showOtpVerification = false;
  otpEmail = '';
  otpCode = '';
  otpMessage = '';
  otpTimer = 0;
  canResendOtp = false;

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.errorType = 'error';
    this.showForgotPassword = false;
    this.showOtpVerification = false;
    this.forgotEmail = '';
    this.forgotMessage = '';
    this.otpEmail = '';
    this.otpCode = '';
    this.otpMessage = '';
  }

  validateLoginForm(): FormValidation {
    if (!this.email.trim()) {
      return { isValid: false, message: '❌ Vui lòng nhập email của bạn.' };
    }
    
    if (!this.isValidEmail(this.email)) {
      return { isValid: false, message: '❌ Email không hợp lệ. Vui lòng kiểm tra lại.' };
    }
    
    if (!this.password) {
      return { isValid: false, message: '❌ Vui lòng nhập mật khẩu của bạn.' };
    }
    
    if (this.password.length < 6) {
      return { isValid: false, message: '❌ Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    return { isValid: true, message: '' };
  }

  validateRegisterForm(): FormValidation {
    if (!this.name.trim()) {
      return { isValid: false, message: '❌ Vui lòng nhập họ tên của bạn.' };
    }
    
    if (this.name.trim().length < 2) {
      return { isValid: false, message: '❌ Họ tên phải có ít nhất 2 ký tự.' };
    }
    
    if (!this.email.trim()) {
      return { isValid: false, message: '❌ Vui lòng nhập email của bạn.' };
    }
    
    if (!this.isValidEmail(this.email)) {
      return { isValid: false, message: '❌ Email không hợp lệ. Vui lòng kiểm tra lại.' };
    }
    
    if (!this.password) {
      return { isValid: false, message: '❌ Vui lòng nhập mật khẩu của bạn.' };
    }
    
    if (this.password.length < 6) {
      return { isValid: false, message: '❌ Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    return { isValid: true, message: '' };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    if(this.showForgotPassword || this.showOtpVerification){
      return;
    }

    // Validate form
    const validation = this.isLoginMode ? this.validateLoginForm() : this.validateRegisterForm();
    if (!validation.isValid) {
      this.error = validation.message;
      this.errorType = 'error';
      return;
    }

    this.loading = true;
    this.error = '';
    this.errorType = 'error';
    this.forgotMessage = '';

    if (this.isLoginMode) {
      // Đăng nhập
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.error = '';
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loading = false;
          this.handleLoginError(err);
        },
      });
    } else {
      // Đăng ký tài khoản mới
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.showOtpVerification = true;
          this.otpEmail = this.email;
          this.onSendOtp();
        },
        error: (err) => {
          this.loading = false;
          this.handleRegisterError(err);
        },
      });
    }
  }

  private handleLoginError(err: any) {
    const errorMessage = err.message || 'Đăng nhập thất bại';
    
    if (errorMessage.includes('không chính xác')) {
      this.error = '❌ Email hoặc mật khẩu không chính xác. Vui lòng thử lại.';
      this.errorType = 'error';
    } else if (errorMessage.includes('kết nối mạng')) {
      this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
      this.errorType = 'warning';
    } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
      this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
      this.errorType = 'warning';
    } else if (errorMessage.includes('Quá nhiều yêu cầu')) {
      this.error = '⚠️ Quá nhiều lần thử đăng nhập. Vui lòng chờ một lúc rồi thử lại.';
      this.errorType = 'warning';
    } else if (errorMessage.includes('hết thời gian')) {
      this.error = '⚠️ Kết nối hết thời gian. Vui lòng kiểm tra kết nối và thử lại.';
      this.errorType = 'warning';
    } else {
      this.error = `❌ ${errorMessage}`;
      this.errorType = 'error';
    }
  }

  private handleRegisterError(err: any) {
    const errorMessage = err.message || 'Đăng ký thất bại';
    
    if (errorMessage.includes('đã được sử dụng') || errorMessage.includes('Email')) {
      this.error = '❌ Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.';
      this.errorType = 'error';
    } else if (errorMessage.includes('kết nối mạng')) {
      this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
      this.errorType = 'warning';
    } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
      this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
      this.errorType = 'warning';
    } else if (errorMessage.includes('không hợp lệ')) {
      this.error = '❌ Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại.';
      this.errorType = 'error';
    } else if (errorMessage.includes('hết thời gian')) {
      this.error = '⚠️ Kết nối hết thời gian. Vui lòng kiểm tra kết nối và thử lại.';
      this.errorType = 'warning';
    } else {
      this.error = `❌ ${errorMessage}`;
      this.errorType = 'error';
    }
  }

  onSendResetEmail() {
    this.forgotMessage = '';
    this.error = '';
    this.errorType = 'error';
    
    if (!this.forgotEmail.trim()) {
      this.error = '❌ Vui lòng nhập email để nhận link khôi phục mật khẩu.';
      this.errorType = 'error';
      return;
    }

    if (!this.isValidEmail(this.forgotEmail)) {
      this.error = '❌ Email không hợp lệ. Vui lòng kiểm tra lại.';
      this.errorType = 'error';
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.loading = false;
        this.forgotMessage = '✓ Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra inbox của bạn.';
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.message || 'Lỗi gửi email khôi phục mật khẩu';
        
        if (errorMessage.includes('không tìm thấy') || errorMessage.includes('không tồn tại')) {
          this.error = '❌ Email này không được đăng ký trong hệ thống.';
          this.errorType = 'error';
        } else if (errorMessage.includes('kết nối mạng')) {
          this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
          this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('hết thời gian')) {
          this.error = '⚠️ Kết nối hết thời gian. Vui lòng thử lại.';
          this.errorType = 'warning';
        } else {
          this.error = `❌ ${errorMessage}`;
          this.errorType = 'error';
        }
      },
    });
  }

  // OTP verification methods
  onSendOtp() {
    this.otpMessage = '';
    this.error = '';
    this.errorType = 'error';
    this.loading = true;

    this.authService.sendVerificationOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.otpMessage = '✓ Mã OTP đã được gửi tới email của bạn. Vui lòng kiểm tra inbox.';
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.message || 'Lỗi khi gửi OTP';
        
        if (errorMessage.includes('kết nối mạng')) {
          this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
          this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('Quá nhiều')) {
          this.error = '⚠️ Quá nhiều lần gửi. Vui lòng chờ trước khi gửi lại.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('hết thời gian')) {
          this.error = '⚠️ Kết nối hết thời gian. Vui lòng thử lại.';
          this.errorType = 'warning';
        } else {
          this.error = `❌ ${errorMessage}`;
          this.errorType = 'error';
        }
      },
    });
  }

  onVerifyOtp() {
    this.error = '';
    this.errorType = 'error';
    this.otpMessage = '';

    if (!this.otpCode || this.otpCode.length !== 6) {
      this.error = '❌ Vui lòng nhập mã OTP 6 chữ số.';
      this.errorType = 'error';
      return;
    }

    this.loading = true;
    this.authService.verifyOtp(this.otpEmail, this.otpCode).subscribe({
      next: (response) => {
        this.loading = false;
        this.otpMessage = '✓ Email xác thực thành công!';
        if (response.token) {
          localStorage.setItem('currentUser', JSON.stringify({
            _id: response.user._id,
            name: response.user.name,
            email: response.user.email,
            token: response.token,
            role: response.user.role,
            isEmailVerified: response.user.isEmailVerified,
          }));
        }
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.message || 'Lỗi xác thực OTP';
        
        if (errorMessage.includes('không chính xác') || errorMessage.includes('không hợp lệ')) {
          this.error = '❌ Mã OTP không chính xác. Vui lòng kiểm tra lại.';
          this.errorType = 'error';
        } else if (errorMessage.includes('hết hạn')) {
          this.error = '❌ Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.';
          this.errorType = 'error';
        } else if (errorMessage.includes('kết nối mạng')) {
          this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
          this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('hết thời gian')) {
          this.error = '⚠️ Kết nối hết thời gian. Vui lòng thử lại.';
          this.errorType = 'warning';
        } else {
          this.error = `❌ ${errorMessage}`;
          this.errorType = 'error';
        }
      },
    });
  }

  onResendOtp() {
    this.error = '';
    this.errorType = 'error';
    this.loading = true;
    this.authService.resendOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.otpMessage = '✓ Mã OTP mới đã được gửi. Vui lòng kiểm tra email.';
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.message || 'Lỗi gửi lại OTP';
        
        if (errorMessage.includes('kết nối mạng')) {
          this.error = '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('máy chủ') || errorMessage.includes('Server')) {
          this.error = '⚠️ Lỗi máy chủ. Vui lòng thử lại sau một lúc.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('Quá nhiều')) {
          this.error = '⚠️ Quá nhiều lần gửi. Vui lòng chờ trước khi gửi lại.';
          this.errorType = 'warning';
        } else if (errorMessage.includes('hết thời gian')) {
          this.error = '⚠️ Kết nối hết thời gian. Vui lòng thử lại.';
          this.errorType = 'warning';
        } else {
          this.error = `❌ ${errorMessage}`;
          this.errorType = 'error';
        }
      },
    });
  }

  startOtpTimer() {
    this.otpTimer = 600; // 10 minutes in seconds
    this.canResendOtp = false;

    const interval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        clearInterval(interval);
        this.canResendOtp = true;
      }
    }, 1000);
  }

  getOtpTimerText(): string {
    const minutes = Math.floor(this.otpTimer / 60);
    const seconds = this.otpTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
