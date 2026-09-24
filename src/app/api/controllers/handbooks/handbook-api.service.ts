import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  HAddressApiService,
  HBranchApiService,
  HCityApiService,
  HCompanyApiService,
  HVillageService,
} from '@api/controllers/handbooks';
import { AddressTypeFilter, BranchFilters, CityFilters, CompanyActivityFilters, VillageFilter } from '@api/models/handbooks';
import { HandbookItem, HandbookType } from '@app/typings/handbook';

@Injectable({
  providedIn: 'root',
})
export class HandbookApiService {
  private readonly cityApi = inject(HCityApiService);
  private readonly villageApi = inject(HVillageService);
  private readonly companyApi = inject(HCompanyApiService);
  private readonly branchApi = inject(HBranchApiService);
  private readonly addressApi = inject(HAddressApiService);

  public getAll$<T extends HandbookItem = HandbookItem>(
    type: HandbookType,
    params: Record<string, unknown> = {},
  ): Observable<T[]> {
    return this.request$(type, params).pipe(map((response) => response.data as T[]));
  }

  private request$(type: HandbookType, params: Record<string, unknown>) {
    switch (type) {
      case 'dir-city':
        return this.cityApi.getAll$(params as Partial<CityFilters>);
      case 'dir-village':
        return this.villageApi.getAll$(params as Partial<VillageFilter>);
      case 'dir-company-activity':
        return this.companyApi.getAll$(params as Partial<CompanyActivityFilters>);
      case 'dir-branch':
        return this.branchApi.getAll$(params as Partial<BranchFilters>);
      case 'sys-address-type':
        return this.addressApi.getAll$(params as Partial<AddressTypeFilter>);
      default: {
        const exhaustive: never = type;
        throw new Error(`Unknown handbook type: ${exhaustive}`);
      }
    }
  }
}
