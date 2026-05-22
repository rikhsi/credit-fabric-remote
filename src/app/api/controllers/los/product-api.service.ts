import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { ProductConditionFilter, ProductConditionItem, ProductFilter, ProductItem } from '@api/models/los/product';
import { buildHttpParams } from '@api/utils';
import { USE_HTTP_CACHE } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  constructor(private http: HttpClient) {}

  public productsAll$(filters?: ProductFilter) {
    return this.http.get<TableOverview<ProductItem>>('product', {
      params: filters ? buildHttpParams(filters) : undefined,
      context: new HttpContext().set(USE_HTTP_CACHE, true),
    });
  }

  public productCondition$(filters?: ProductConditionFilter) {
    return this.http.get<TableOverview<ProductConditionItem>>('product-condition', {
      params: filters ? buildHttpParams(filters) : undefined,
      context: new HttpContext().set(USE_HTTP_CACHE, true),
    });
  }
}
