import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { VillageFilter, VillageItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_VILLAGES } from './handbooks.mock';

@Injectable()
export class MockHVillageApiService {
  public getAll$(_filters: Partial<VillageFilter> = {}): Observable<TableOverview<VillageItem>> {
    return mockOf(MOCK_VILLAGES);
  }
}
