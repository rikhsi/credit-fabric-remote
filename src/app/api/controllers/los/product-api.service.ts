import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductItem } from '@api/models/los/product';
import { USE_HTTP_CACHE } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  constructor(private http: HttpClient) {}

  public getProducts$() {
    return this.http.get<ProductItem[]>('online/product', {
      context: new HttpContext().set(USE_HTTP_CACHE, true),
    });
  }
}
