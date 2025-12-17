import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
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
    this.showForgotPassword = false;
    this.showOtpVerification = false;
    this.forgotEmail = '';
    this.forgotMessage = '';
    this.otpEmail = '';
    this.otpCode = '';
    this.otpMessage = '';
  }

  onSubmit() {
    if(this.showForgotPassword || this.showOtpVerification){
      return;
    }
    if (!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.forgotMessage = '';

    if (this.isLoginMode) {
      // Đăng nhập với Firebase
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/home']); // hoặc '/'
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Login failed';
        },
      });
    } else {
      // Đăng ký tài khoản mới
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: () => {
          this.loading = false;
          // After successful registration, show OTP verification
          this.showOtpVerification = true;
          this.otpEmail = this.email;
          this.onSendOtp();
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Registration failed';
        },
      });
    }
  }

  onSendResetEmail() {
    this.forgotMessage = '';
    this.error = '';
    if (!this.forgotEmail) {
      this.error = 'Please enter your email to get password reset link.';
      return;
    }
    this.loading = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.loading = false;
        this.forgotMessage = 'Password reset email sent. Please check your inbox.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Failed to send password reset email.';
      },
    });
  }

  // OTP verification methods
  onSendOtp() {
    this.otpMessage = '';
    this.error = '';
    this.loading = true;

    this.authService.sendVerificationOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.otpMessage = 'Mã OTP đã được gửi tới email của bạn.';
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Lỗi khi gửi OTP.';
      },
    });
  }

  onVerifyOtp() {
    this.error = '';
    this.otpMessage = '';

    if (!this.otpCode || this.otpCode.length !== 6) {
      this.error = 'Vui lòng nhập mã OTP 6 chữ số.';
      return;
    }

    this.loading = true;
    this.authService.verifyOtp(this.otpEmail, this.otpCode).subscribe({
      next: (response) => {
        this.loading = false;
        this.otpMessage = 'Email xác thực thành công!';
        // Store token and redirect after 2 seconds
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
        this.error = err.message || 'Lỗi xác thực OTP.';
      },
    });
  }

  onResendOtp() {
    this.error = '';
    this.loading = true;
    this.authService.resendOtp(this.otpEmail).subscribe({
      next: () => {
        this.loading = false;
        this.otpMessage = 'Mã OTP mới đã được gửi.';
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Lỗi gửi lại OTP.';
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
