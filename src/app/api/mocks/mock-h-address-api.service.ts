import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { AddressTypeFilter, AddressTypeItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_ADDRESS_TYPES } from './handbooks.mock';

@Injectable()
export class MockHAddressApiService {
  public getAll$(_filters: Partial<AddressTypeFilter> = {}): Observable<TableOverview<AddressTypeItem>> {
    return mockOf(MOCK_ADDRESS_TYPES);
  }
}
