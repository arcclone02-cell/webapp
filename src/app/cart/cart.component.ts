import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { CartService } from './cart.service';
import { ToastService } from '../_helpers/toast.service';

interface CartItem {
  _id?: string;
  productId?: string;
  title?: string;
  alt?: string;
  price: number;
  image?: string;
  src?: { large: string; medium: string; small: string };
  quantity: number;
  id?: number;
  photographer?: string;
  url?: string;
  _cartIndex?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;
  apiUrl = 'http://localhost:3000/api';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const token = this.authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    fetch(`${this.apiUrl}/cart`, {
      method: 'GET',
      headers: headers
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          this.cartItems = (data.data.items || []).map((item: any, index: number) => ({
            ...item,
            _cartIndex: index
          }));
          console.log('Cart items loaded:', this.cartItems);
        }
        this.loading = false;
      })
      .catch(err => {
        console.error('Error loading cart:', err);
        this.toastService.error('Lỗi khi tải giỏ hàng. Vui lòng thử lại!');
        this.loading = false;
      });
  }

  removeItem(index: number | string): void {
    const itemIndex = typeof index === 'string' ? parseInt(index) : index;
    const item = this.cartItems[itemIndex];
    
    if (!item) {
      console.error('Item not found at index:', itemIndex);
      return;
    }

    const token = this.authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Lấy quantity trước khi xóa để cập nhật cart count
    const quantity = item.quantity || 1;
    
    // Dùng item.id (từ Pexels) làm itemId
    const itemId = item.id?.toString() || item._id || '';
    
    console.log('Removing item:', { itemIndex, itemId, item });

    // Gửi request xóa
    const body = { itemId };
    fetch(`${this.apiUrl}/cart/remove`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        console.log('Remove response:', data);
        if (data.success) {
          this.cartItems.splice(itemIndex, 1);
          this.toastService.success('Đã xóa sản phẩm khỏi giỏ hàng');
          // Cập nhật cart count
          this.cartService.decrementCartCount(quantity);
        }
      })
      .catch(err => {
        console.error('Error removing item:', err);
        this.toastService.error('Lỗi khi xóa sản phẩm');
        // Xóa local ngay cả khi API thất bại
        this.cartItems.splice(itemIndex, 1);
        this.cartService.decrementCartCount(quantity);
      });
  }

  updateQuantity(index: number | string, quantity: number): void {
    const itemIndex = typeof index === 'string' ? parseInt(index) : index;
    const item = this.cartItems[itemIndex];
    
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(itemIndex);
      return;
    }

    const token = this.authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Lấy quantity cũ để tính difference
    const oldQuantity = item.quantity || 1;
    const quantityDifference = quantity - oldQuantity;
    const itemId = item.id?.toString() || item._id || '';

    const body = { itemId, quantity };
    fetch(`${this.apiUrl}/cart/update-quantity`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          item.quantity = quantity;
          this.toastService.success('Cập nhật số lượng thành công');
          // Cập nhật cart count dựa vào sự thay đổi
          if (quantityDifference > 0) {
            this.cartService.incrementCartCount(quantityDifference);
          } else if (quantityDifference < 0) {
            this.cartService.decrementCartCount(Math.abs(quantityDifference));
          }
        }
      })
      .catch(err => {
        console.error('Error updating quantity:', err);
        this.toastService.error('Lỗi khi cập nhật số lượng');
        // Cập nhật local ngay cả khi API thất bại
        item.quantity = quantity;
        if (quantityDifference > 0) {
          this.cartService.incrementCartCount(quantityDifference);
        } else if (quantityDifference < 0) {
          this.cartService.decrementCartCount(Math.abs(quantityDifference));
        }
      });
  }

  clearCart(): void {
    const token = this.authService.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Tính tổng quantity trước khi xóa
    const totalQuantity = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    fetch(`${this.apiUrl}/cart`, {
      method: 'DELETE',
      headers: headers
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.cartItems = [];
          this.toastService.success('Giỏ hàng đã được xóa');
          // Reset cart count
          this.cartService.resetCartCount();
        }
      })
      .catch(err => {
        console.error('Error clearing cart:', err);
        this.toastService.error('Lỗi khi xóa giỏ hàng');
      });
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  get total(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get itemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}
