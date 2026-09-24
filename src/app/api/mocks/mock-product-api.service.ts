import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductItem } from '@api/models/los/product';
import { mockOf } from './mock-delay';
import { MOCK_PRODUCTS } from './products.mock';

@Injectable()
export class MockProductApiService {
  public getProducts$(): Observable<ProductItem[]> {
    return mockOf(MOCK_PRODUCTS);
  }
}
