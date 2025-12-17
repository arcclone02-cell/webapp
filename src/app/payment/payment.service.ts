import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Tạo URL thanh toán VNPay
   * @param cartItems - Danh sách sản phẩm trong giỏ
   * @param totalAmount - Tổng tiền
   */
  createPaymentUrl(cartItems: any[], totalAmount: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('💳 Creating payment URL');
    console.log('📦 Cart items:', cartItems.length);
    console.log('💰 Total amount:', totalAmount);

    return this.http.post(`${this.apiUrl}/create-payment-url`, {
      cartItems,
      totalAmount
    }, { headers });
  }
}
