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

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }

  onSubmit() {
    if (!this.email || !this.password || (!this.isLoginMode && !this.name)) {
      this.error = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.error = '';

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
          alert('Account created successfully! You can now login.');
          this.isLoginMode = true;
        },
        error: (err) => {
          this.loading = false;
          this.error = err.message || 'Registration failed';
        },
      });
    }
  }
}
