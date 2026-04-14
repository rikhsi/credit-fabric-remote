import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { ProductFilter, ProductItem } from '@api/models/los';
import { buildHttpParams } from '@api/utils';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  constructor(private http: HttpClient) {}

  public productsAll$(filters?: ProductFilter) {
    return this.getQueue$<TableOverview<ProductItem>>('product', filters);
  }

  private getQueue$<T>(url: string, filters?: ProductFilter) {
    return this.http.get<TableOverview<T>>(url, {
      params: filters ? buildHttpParams(filters) : undefined,
    });
  }
}
