import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { CompanyActivityFilters, CompanyActivityItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_COMPANY_ACTIVITIES } from './handbooks.mock';

@Injectable()
export class MockHCompanyApiService {
  public getAll$(_filters: Partial<CompanyActivityFilters> = {}): Observable<TableOverview<CompanyActivityItem>> {
    return mockOf(MOCK_COMPANY_ACTIVITIES);
  }
}
