import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, User } from './auth/auth.service';
import { CartService } from './cart/cart.service';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'E-Market';
  currentUser: User | null = null;
  cartCount = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.cartService.loadCartCount();
      }
    });

    // Subscribe to cart count
    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });

    // Block screenshot capability
    this.blockScreenshot();
  }

  // Block screenshot - prevents Print Screen, Ctrl+Shift+S, Ctrl+Alt+S, etc.
  private blockScreenshot(): void {
    // Disable Print Screen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        console.warn('⚠️ Screenshot attempt blocked');
        alert('Chụp màn hình bị vô hiệu hóa để bảo vệ bảo mật');
      }
      
      // Block Ctrl+Shift+S (Chrome/Edge screenshot)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        console.warn('⚠️ Ctrl+Shift+S blocked');
        alert('Chụp màn hình bị vô hiệu hóa để bảo vệ bảo mật');
      }
      
      // Block Ctrl+Alt+S
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        console.warn('⚠️ Ctrl+Alt+S blocked');
        alert('Chụp màn hình bị vô hiệu hóa để bảo vệ bảo mật');
      }
    });

    // Disable right-click to prevent Print and Save options
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      console.warn('⚠️ Right-click attempt blocked');
      return false;
    });

    // Detect DevTools opening
    const devtoolsOpen = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        console.warn('⚠️ DevTools detected - screenshot features disabled');
      }
    };
    
    setInterval(devtoolsOpen, 1000);
  }

  @HostListener('window:screencaptureprohibited', ['$event'])
  onScreenCaptureAttempt(event: any): void {
    console.warn('⚠️ Screen capture attempt detected');
    alert('Chụp màn hình bị vô hiệu hóa để bảo vệ bảo mật');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUser && !!this.currentUser.token;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
