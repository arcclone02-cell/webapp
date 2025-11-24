import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LibraryService, Product, Purchase } from './library.service';
import { AuthService } from '../auth/auth.service';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'],
})
export class LibraryComponent implements OnInit {
  // My Products Section
  myProducts: Product[] = [];
  loadingProducts = false;

  // Purchased Products Section
  purchasedProducts: Purchase[] = [];
  loadingPurchases = false;

  selectedTab = 0;

  constructor(
    private libraryService: LibraryService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyProducts();
    this.loadPurchasedProducts();
  }

  // Load my products
  loadMyProducts(): void {
    this.loadingProducts = true;
    this.libraryService.getMyProducts().subscribe({
      next: (response) => {
        this.myProducts = response.products || [];
        this.loadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadingProducts = false;
      },
    });
  }

  // Load purchased products
  loadPurchasedProducts(): void {
    this.loadingPurchases = true;
    this.libraryService.getPurchases().subscribe({
      next: (response) => {
        this.purchasedProducts = response.purchases || [];
        this.loadingPurchases = false;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.loadingPurchases = false;
      },
    });
  }

  // Open dialog to create/edit product
  openProductForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: product || null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (product && product._id) {
          // Update product
          this.libraryService.updateProduct(product._id, result).subscribe({
            next: () => {
              this.loadMyProducts();
            },
            error: (error) => {
              console.error('Error updating product:', error);
            },
          });
        } else {
          // Create product
          this.libraryService.createProduct(result).subscribe({
            next: () => {
              this.loadMyProducts();
            },
            error: (error) => {
              console.error('Error creating product:', error);
            },
          });
        }
      }
    });
  }

  // Delete product
  deleteProduct(productId: string): void {
    if (confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
      this.libraryService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadMyProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        },
      });
    }
  }

  // Format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  // Get status badge color
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'primary',
      inactive: 'warn',
      sold: 'accent',
      completed: 'primary',
      pending: 'warn',
      cancelled: 'warn',
    };
    return colors[status] || 'primary';
  }

  // Get status label
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Đang bán',
      inactive: 'Ngừng bán',
      sold: 'Đã bán',
      completed: 'Hoàn tất',
      pending: 'Chờ xử lý',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  }
}
