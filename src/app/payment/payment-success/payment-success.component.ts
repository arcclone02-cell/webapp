import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  orderId: string = '';
  amount: number = 0;
  transactionId: string = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('✅ Payment Success Page Loaded');
    
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || '';
      this.amount = parseFloat(params['amount']) || 0;
      this.transactionId = params['transactionId'] || '';
      this.loading = false;

      console.log('📊 Order Details:');
      console.log('  - Order ID:', this.orderId);
      console.log('  - Amount:', this.amount);
      console.log('  - Transaction ID:', this.transactionId);
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goLibrary(): void {
    this.router.navigate(['/library']);
  }

  viewOrders(): void {
    this.router.navigate(['/profile']);
  }
}
