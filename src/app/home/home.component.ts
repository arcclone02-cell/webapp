import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { ToastService } from '../_helpers/toast.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';

interface Photo {
  id: number;
  src: { large: string; medium: string; small: string };
  alt: string;
  photographer: string;
  url: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [ FormsModule, MatIconModule, CommonModule, MatProgressSpinnerModule, HttpClientModule ],
})
export class HomeComponent implements OnInit {
  photos: Photo[] = [];
  newArrivals: Photo[] = [];
  hotSelling: Photo[] = [];
  featured: Photo[] = [];
  freeProducts: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  openPhoto: Photo | null = null;
  openFreeProduct: any = null;
  randomPrices: { [id: number]: number } = {};
  userId: string | null = null;
  selectedColor: string = '';
  priceRange: number = 500;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    public authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadFreeProducts();
    this.userId = this.authService.getUserId();
  }

  loadFreeProducts(): void {
    this.http.get<any>(`${environment.apiUrl}/products/free`).subscribe({
      next: data => {
        this.freeProducts = data || [];
      },
      error: err => {
        console.error('Error loading free products:', err);
        this.freeProducts = [];
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const headers = new HttpHeaders({
      Authorization: '10CP61LVxmAuRwW48CidKoDNj66e6oFmrjRIfv383jmqNeGDe4xCfd1s'
    });

    // Load 3 sections
    this.http.get<any>(
      `https://api.pexels.com/v1/search?query=trading cards&per_page=8`, { headers }
    ).subscribe({
      next: data => {
        this.newArrivals = data.photos || [];
        this.assignPrices(this.newArrivals);
        this.loading = false;
      },
      error: err => {
        console.error('Error loading new arrivals:', err);
        this.loading = false;
      }
    });

    this.http.get<any>(
      `https://api.pexels.com/v1/search?query=popular cards&per_page=8`, { headers }
    ).subscribe({
      next: data => {
        this.hotSelling = data.photos || [];
        this.assignPrices(this.hotSelling);
      },
      error: err => console.error('Error loading hot selling:', err)
    });

    this.http.get<any>(
      `https://api.pexels.com/v1/search?query=collection&per_page=8`, { headers }
    ).subscribe({
      next: data => {
        this.featured = data.photos || [];
        this.assignPrices(this.featured);
      },
      error: err => console.error('Error loading featured:', err)
    });
  }

  assignPrices(photos: Photo[]): void {
    photos.forEach(photo => {
      if (!this.randomPrices[photo.id]) {
        this.randomPrices[photo.id] = this.getRandomPrice();
      }
    });
  }

  fetchPhotos(query: string) {
    this.loading = true;
    const headers = new HttpHeaders({
      Authorization: '10CP61LVxmAuRwW48CidKoDNj66e6oFmrjRIfv383jmqNeGDe4xCfd1s'
    });

    this.http.get<any>(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=18`, { headers }
    ).subscribe({
      next: data => {
        this.photos = data.photos || [];
        this.assignPrices(this.photos);
        this.loading = false;
      },
      error: err => {
        this.photos = [];
        this.loading = false;
      }
    });
  }

  onSearch(event: Event) {
    event.preventDefault();
    if (this.searchTerm.trim()) {
      this.fetchPhotos(this.searchTerm);
    }
  }

  getRandomPrice(): number {
    // Giả lập giá trị từ 90 đến 350
    return Math.floor(Math.random() * (350 - 90 + 1)) + 90;
  }

  showPhotoDetail(photo: Photo) {
    this.openPhoto = photo;
    this.openFreeProduct = null;
  }

  showFreeProductDetail(product: any) {
    this.openFreeProduct = product;
    this.openPhoto = null;
  }

  closeDialog() {
    this.openPhoto = null;
    this.openFreeProduct = null;
  }

  async addToCart(photo: Photo) {
    if (!this.userId) {
      this.toastService.warning('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    const photoData = {
      ...photo,
      price: this.randomPrices[photo.id],
      addedAt: new Date().toISOString()
    };

    const currentUser = this.authService.currentUserValue;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${currentUser?.token || ''}`,
      'Content-Type': 'application/json'
    });

    // Call MongoDB API to add item to cart
    this.http.post(
      `${environment.apiUrl}/cart/add`,
      { item: photoData },
      { headers }
    ).subscribe({
      next: (response: any) => {
        this.toastService.success('Đã thêm vào giỏ hàng của bạn!');
        this.closeDialog();
        // Cập nhật cart count
        this.cartService.incrementCartCount(1);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.toastService.error('Có lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!');
      }
    });
  }

  async addFreeProductToCart(product: any) {
    if (!this.userId) {
      this.toastService.warning('Bạn cần đăng nhập để mua sản phẩm!');
      return;
    }

    const currentUser = this.authService.currentUserValue;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${currentUser?.token || ''}`,
      'Content-Type': 'application/json'
    });

    this.http.post(
      `${environment.apiUrl}/purchases/free`,
      { productId: product._id, quantity: 1 },
      { headers }
    ).subscribe({
      next: (response: any) => {
        this.toastService.success('Bạn đã lấy sản phẩm miễn phí thành công! Kiểm tra mục "Sản phẩm đã mua"');
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error purchasing free product:', err);
        this.toastService.error('Lỗi khi lấy sản phẩm miễn phí. Vui lòng thử lại!');
      }
    });
  }
}