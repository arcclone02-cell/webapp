import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService, Toast } from '../../_helpers/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts" 
        [class]="'toast toast-' + toast.type"
        [@slideInOut]
        (mouseenter)="pauseToast(toast.id)"
        (mouseleave)="resumeToast(toast.id)"
      >
        <div class="toast-content">
          <span class="toast-icon" [ngClass]="'icon-' + toast.type">
            <ng-container [ngSwitch]="toast.type">
              <span *ngSwitchCase="'success'">✓</span>
              <span *ngSwitchCase="'error'">✕</span>
              <span *ngSwitchCase="'warning'">⚠</span>
              <span *ngSwitchDefault>ℹ</span>
            </ng-container>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="removeToast(toast.id)">×</button>
        </div>
        <div class="toast-progress" [style.animation-duration]="(toast.duration || 3000) + 'ms'"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 450px;
    }

    .toast {
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-bottom: 12px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      pointer-events: all;
      min-width: 320px;
      max-width: 100%;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .toast:hover {
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
      transform: translateY(-2px);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
      font-weight: 700;
      font-size: 16px;
      color: white;
    }

    .icon-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .icon-error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .icon-warning {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .icon-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .toast-message {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      line-height: 1.5;
      color: #1f2937;
    }

    .toast-close {
      background: transparent;
      border: none;
      font-size: 24px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #4b5563;
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 4px;
      animation: progressBar linear forwards;
    }

    @keyframes progressBar {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    /* Success Toast */
    .toast-success {
      border-left: 5px solid #10b981;
    }

    .toast-success .toast-progress {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    /* Error Toast */
    .toast-error {
      border-left: 5px solid #ef4444;
    }

    .toast-error .toast-progress {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }

    /* Warning Toast */
    .toast-warning {
      border-left: 5px solid #f59e0b;
    }

    .toast-warning .toast-progress {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    /* Info Toast */
    .toast-info {
      border-left: 5px solid #3b82f6;
    }

    .toast-info .toast-progress {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 12px;
        right: 12px;
        top: 12px;
        max-width: none;
      }

      .toast {
        min-width: unset;
      }

      .toast-message {
        font-size: 14px;
      }
    }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ 
          transform: 'translateX(400px) rotateX(90deg)', 
          opacity: 0 
        }),
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ 
            transform: 'translateX(0) rotateX(0deg)', 
            opacity: 1 
          })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ 
            transform: 'translateX(400px)', 
            opacity: 0 
          })
        )
      ])
    ])
  ]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];
  private pausedToasts: Set<string> = new Set();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: string) {
    this.toastService.remove(id);
    this.pausedToasts.delete(id);
  }

  pauseToast(id: string) {
    this.pausedToasts.add(id);
  }

  resumeToast(id: string) {
    this.pausedToasts.delete(id);
  }
}
