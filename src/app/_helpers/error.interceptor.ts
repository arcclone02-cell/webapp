import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';

// Helper function to get user-friendly error message
function getErrorMessage(err: any): string {
  // Network error
  if (!err.status) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
  }

  // Timeout error
  if (err.status === 0 && err.statusText === '') {
    return 'Lỗi kết nối: Server không phản hồi. Vui lòng thử lại sau.';
  }

  // Server error responses
  switch (err.status) {
    case 400:
      return err.error?.message || 'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu nhập.';
    case 401:
      return err.error?.message || 'Email hoặc mật khẩu không chính xác.';
    case 403:
      return 'Bạn không có quyền truy cập tài nguyên này.';
    case 404:
      return 'Tài nguyên không tìm thấy.';
    case 409:
      return err.error?.message || 'Dữ liệu bị xung đột. Vui lòng thử lại.';
    case 422:
      return err.error?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    case 429:
      return 'Quá nhiều yêu cầu. Vui lòng chờ một lúc trước khi thử lại.';
    case 500:
      return 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
    case 502:
      return 'Máy chủ tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 503:
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    case 504:
      return 'Hết thời gian chờ kết nối. Vui lòng thử lại sau.';
    default:
      return err.error?.message || err.statusText || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}

// Functional interceptor (Angular 15+)
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout();
        location.reload();
      }

      const error = getErrorMessage(err);
      return throwError(() => new Error(error));
    })
  );
};

// Class-based interceptor (for backward compatibility)
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          this.authService.logout();
          location.reload();
        }

        const error = getErrorMessage(err);
        return throwError(() => new Error(error));
      })
    );
  }
}
