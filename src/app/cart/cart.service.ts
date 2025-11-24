import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$: Observable<number> = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCartCount();
  }

  loadCartCount(): void {
    const token = localStorage.getItem('currentUser');
    if (!token) return;

    const user = JSON.parse(token);
    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };

    fetch('http://localhost:3000/api/cart', {
      method: 'GET',
      headers: headers
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const count = (data.data.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          this.cartCountSubject.next(count);
        }
      })
      .catch(err => console.error('Error loading cart count:', err));
  }

  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  incrementCartCount(quantity: number = 1): void {
    const current = this.cartCountSubject.value;
    this.cartCountSubject.next(current + quantity);
  }

  decrementCartCount(quantity: number = 1): void {
    const current = this.cartCountSubject.value;
    this.cartCountSubject.next(Math.max(0, current - quantity));
  }

  resetCartCount(): void {
    this.cartCountSubject.next(0);
  }
}
