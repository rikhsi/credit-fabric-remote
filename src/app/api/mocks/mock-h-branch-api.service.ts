import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { BranchFilters, BranchItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_HANDBOOK_BRANCHES } from './handbooks.mock';

@Injectable()
export class MockHBranchApiService {
  public getAll$(_filters: Partial<BranchFilters> = {}): Observable<TableOverview<BranchItem>> {
    return mockOf(MOCK_HANDBOOK_BRANCHES);
  }
}
