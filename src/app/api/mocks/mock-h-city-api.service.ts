import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { CityFilters, CityItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_CITIES } from './handbooks.mock';

@Injectable()
export class MockHCityApiService {
  public getAll$(_filters: Partial<CityFilters> = {}): Observable<TableOverview<CityItem>> {
    return mockOf(MOCK_CITIES);
  }
}
