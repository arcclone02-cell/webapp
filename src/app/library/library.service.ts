import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id?: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  status: string;
  ratings: {
    average: number;
    count: number;
  };
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Purchase {
  _id?: string;
  buyerId: string;
  productId: string;
  sellerId: string;
  productData: {
    title: string;
    price: number;
    image: string;
    description: string;
  };
  quantity: number;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  review?: {
    rating: number;
    comment: string;
    reviewedAt: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  constructor(private http: HttpClient) {}

  // Get my products
  getMyProducts(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products`);
  }

  // Create product
  createProduct(product: Product): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/products`, product);
  }

  // Get product by ID
  getProduct(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/products/${id}`);
  }

  // Update product
  updateProduct(id: string, product: Partial<Product>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/products/${id}`, product);
  }

  // Delete product
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/products/${id}`);
  }

  // Get my purchases
  getPurchases(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/purchases/purchases`);
  }

  // Get my sales (products sold)
  getSales(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/purchases/sales`);
  }

  // Create purchase
  createPurchase(purchase: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/purchases`, purchase);
  }

  // Add review to purchase
  addReview(purchaseId: string, review: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/purchases/${purchaseId}/review`, review);
  }
}
