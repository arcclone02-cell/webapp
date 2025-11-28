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

// Functional interceptor (Angular 15+)
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout();
        location.reload();
      }

      const error = err.error?.message || err.statusText || 'Error';
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

        const error = err.error?.message || err.statusText || 'Error';
        return throwError(() => new Error(error));
      })
    );
  }
}
