import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { CreditPurposeFilters, CreditPurposeItem } from '@api/models/handbooks';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class HCreditPurposeApiService {
  constructor(private http: HttpClient) {}

  public getAll$(filters: CreditPurposeFilters) {
    return this.http.get<TableOverview<CreditPurposeItem>>('dir-credit-purpose', {
      params: buildHttpParams(filters),
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
    });
  }
}
