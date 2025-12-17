import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.css']
})
export class PaymentFailedComponent implements OnInit {
  errorCode: string = '';
  errorMessage: string = '';
  loading = true;

  private errorMessages: { [key: string]: string } = {
    '01': 'Giao dịch không được chấp nhận',
    '02': 'Nhà cấp thẻ từ chối giao dịch',
    '03': 'Khách hàng hủy giao dịch',
    '04': 'Giao dịch thất bại',
    '05': 'Giao dịch không được xác thực',
    '06': 'Giao dịch không thành công',
    '07': 'Lỗi hệ thống',
    '08': 'Giao dịch chưa được cấp phép',
    '09': 'Giao dịch từ chối do thẻ bị khóa',
    '10': 'Giao dịch thất bại',
    '99': 'Lỗi không xác định'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('❌ Payment Failed Page Loaded');
    
    this.route.queryParams.subscribe(params => {
      this.errorCode = params['code'] || '99';
      this.errorMessage = this.errorMessages[this.errorCode] || 'Giao dịch không thành công. Vui lòng thử lại.';
      this.loading = false;

      console.log('⚠️ Error Details:');
      console.log('  - Code:', this.errorCode);
      console.log('  - Message:', this.errorMessage);
    });
  }

  retryPayment(): void {
    this.router.navigate(['/cart']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goLibrary(): void {
    this.router.navigate(['/library']);
  }
}
