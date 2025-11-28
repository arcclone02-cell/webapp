import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

// Functional interceptor (Angular 15+)
export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const authService = inject(AuthService);
  
  const currentUser = authService.currentUserValue;
  const isLoggedIn = currentUser && currentUser.token;
  const isApiUrl = req.url.startsWith(environment.apiUrl);
  
  if (isLoggedIn && isApiUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`,
      },
    });
  }

  return next(req);
};

// Class-based interceptor (for backward compatibility)
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const currentUser = this.authService.currentUserValue;
    const isLoggedIn = currentUser && currentUser.token;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
    }

    return next.handle(request);
  }
}
