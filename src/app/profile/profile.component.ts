import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationModalComponent } from '../components/notification-modal/notification-modal.component';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationModalComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  activeTab: 'info' | 'purchases' | 'sales' = 'info';
  loading = true;
  error = '';
  
  // Sales and Purchases
  purchases: any[] = [];
  sales: any[] = [];
  purchasesLoading = false;
  salesLoading = false;
  
  // Change password
  showChangePassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changePasswordLoading = false;
  changePasswordMessage = '';
  changePasswordError = '';

  // Notification Modal
  notificationVisible = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'info';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.error = 'Không thể tải thông tin người dùng';
        this.loading = false;
        // Redirect to login if not authenticated
        this.router.navigate(['/auth']);
      }
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Chưa cập nhật';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatDateTime(date: string | undefined): string {
    if (!date) return 'Chưa cập nhật';
    return new Date(date).toLocaleString('vi-VN');
  }

  // Change password methods
  toggleChangePassword() {
    this.showChangePassword = !this.showChangePassword;
    if (!this.showChangePassword) {
      this.resetPasswordForm();
    }
  }

  resetPasswordForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.changePasswordMessage = '';
    this.changePasswordError = '';
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.changePasswordError = 'Vui lòng điền tất cả các trường';
      this.showToast('Vui lòng điền tất cả các trường', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError = 'Mật khẩu mới không khớp';
      this.showToast('Mật khẩu mới không khớp', 'error');
      return;
    }

    if (this.newPassword.length < 6) {
      this.changePasswordError = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      this.showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.changePasswordError = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
      this.showToast('⚠️ Mật khẩu mới không được trùng với mật khẩu hiện tại', 'error');
      return;
    }

    this.changePasswordLoading = true;
    this.changePasswordError = '';
    this.changePasswordMessage = '';

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response: any) => {
        this.changePasswordMessage = '✅ Mật khẩu đã được thay đổi thành công!';
        this.showToast('✅ Mật khẩu đã được thay đổi thành công!', 'success');
        this.resetPasswordForm();
        this.showChangePassword = false;
        this.changePasswordLoading = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        const errorMsg = error.error?.message || 'Lỗi khi đổi mật khẩu';
        this.changePasswordError = errorMsg;
        this.showToast('❌ ' + errorMsg, 'error');
        this.changePasswordLoading = false;
      }
    });
  }

  // Toast notification methods
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notificationMessage = message;
    this.notificationType = type as 'success' | 'error' | 'info' | 'warning';
    this.notificationVisible = true;
    console.log('📢 Notification shown:', message);
  }

  closeNotification() {
    this.notificationVisible = false;
  }

  setActiveTab(tab: 'info' | 'purchases' | 'sales') {
    this.activeTab = tab;
    
    if (tab === 'purchases' && this.purchases.length === 0 && !this.purchasesLoading) {
      this.loadPurchases();
    } else if (tab === 'sales' && this.sales.length === 0 && !this.salesLoading) {
      this.loadSales();
    }
  }

  loadPurchases() {
    this.purchasesLoading = true;
    this.authService.getPurchases().subscribe({
      next: (response: any) => {
        this.purchases = response.purchases || [];
        this.purchasesLoading = false;
        
        if (this.purchases.length === 0) {
          this.showToast('ℹ️ Bạn chưa mua ảnh nào', 'info');
        } else {
          this.showToast('✅ Đã tải ' + this.purchases.length + ' ảnh đã mua', 'success');
        }
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.purchasesLoading = false;
        this.showToast('❌ Lỗi khi tải ảnh đã mua', 'error');
      }
    });
  }

  loadSales() {
    this.salesLoading = true;
    this.authService.getSales().subscribe({
      next: (response: any) => {
        this.sales = response.sales || [];
        this.salesLoading = false;
        
        if (this.sales.length === 0) {
          this.showToast('ℹ️ Bạn chưa bán ảnh nào', 'info');
        } else {
          this.showToast('✅ Đã tải ' + this.sales.length + ' ảnh đã bán', 'success');
        }
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.salesLoading = false;
        this.showToast('❌ Lỗi khi tải ảnh đã bán', 'error');
      }
    });
  }

  logout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
      this.authService.logout();
      this.router.navigate(['/auth']);
    }
  }
}
