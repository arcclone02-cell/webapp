import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.error = 'Token không hợp lệ. Vui lòng yêu cầu lại email khôi phục mật khẩu.';
      }
    });
  }

  onSubmit() {
    this.error = '';
    this.message = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Vui lòng nhập mật khẩu mới.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Mật khẩu không khớp.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự.';
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.message =
          'Mật khẩu đã được đặt lại thành công. Đang chuyển hướng đến trang đăng nhập...';
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Lỗi khi đặt lại mật khẩu.';
      },
    });
  }
}
