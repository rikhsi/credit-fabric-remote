import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { FamilyRelationshipFilters, FamilyRelationshipItem } from '@api/models/handbooks';
import { mockOf } from './mock-delay';
import { MOCK_FAMILY_RELATIONSHIPS } from './handbooks.mock';

@Injectable()
export class MockHFamilyRelationshipApiService {
  public getAll$(_filters: Partial<FamilyRelationshipFilters> = {}): Observable<TableOverview<FamilyRelationshipItem>> {
    return mockOf(MOCK_FAMILY_RELATIONSHIPS);
  }
}
