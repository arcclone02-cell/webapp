import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  searchTerm: string = 'nature';
  loading: boolean = false;
  openPhoto: Photo | null = null;
  randomPrices: { [id: number]: number } = {};
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private firestore: AngularFirestore,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchPhotos(this.searchTerm);
    this.userId = this.authService.getUserId ? this.authService.getUserId() : null;
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
        // Random mock prices for demonstration
        this.randomPrices = {};
        this.photos.forEach(photo => {
          this.randomPrices[photo.id] = this.getRandomPrice();
        });
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
    this.fetchPhotos(this.searchTerm);
  }

  getRandomPrice(): number {
    // Giả lập giá trị từ 90 đến 350
    return Math.floor(Math.random() * (350 - 90 + 1)) + 90;
  }

  showPhotoDetail(photo: Photo) {
    this.openPhoto = photo;
  }

  closeDialog() {
    this.openPhoto = null;
  }

    async addToCart(photo: Photo) {
    if (!this.userId) {
      alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    const photoData = {
      ...photo,
      price: this.randomPrices[photo.id],
      addedAt: Date.now()
    };
    // Lưu ảnh vào collection 'carts' theo userId
    const ref = this.firestore.collection('carts').doc(this.userId);
    const cartDoc = await ref.ref.get();
    if (!cartDoc.exists) {
      await ref.set({ items: [photoData] });
    } else {
      const data = cartDoc.data() as { items?: any[] } | undefined;
      const items: any[] = data && Array.isArray(data.items) ? data.items : [];
      // Kiểm tra trùng id
      if (!items.some((item: any) => item.id === photo.id)) {
        items.push(photoData);
        await ref.update({ items });
      }
    }
    alert('Đã thêm vào giỏ hàng của bạn!');
    this.closeDialog();
  }
}