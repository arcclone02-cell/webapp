import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  _id?: string;
  name: string;
  email: string;
  token?: string;
  role?: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  public currentUserValue: User | null = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.currentUserValue = this.currentUserSubject.value;
  }

  // Sign in with email/password
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      map(response => {
        // login successful if there's a jwt token in the response
        if (response && response.token) {
          // store user details and jwt token in local storage
          const user: User = {
            _id: response.user._id,
            name: response.user.name,
            email: response.user.email,
            token: response.token,
            role: response.user.role,
            createdAt: response.user.createdAt,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.currentUserValue = user;
        }
        return response;
      })
    );
  }

  // Register new user
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, { name, email, password }).pipe(
      map(response => {
        // registration successful if there's a jwt token in the response
        if (response && response.token) {
          // store user details and jwt token in local storage
          const user: User = {
            _id: response.user._id,
            name: response.user.name,
            email: response.user.email,
            token: response.token,
            role: response.user.role,
            createdAt: response.user.createdAt,
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.currentUserValue = user;
        }
        return response;
      })
    );
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  // Sign out
  logout(): void {
    // remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.currentUserValue = null;
  }

  // Get user ID
  getUserId(): string | null {
    const user = this.currentUserValue;
    return user ? user._id || null : null;
  }
}