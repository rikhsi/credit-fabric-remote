import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { EnterpriesClassifierFilters, EnterpriesClassifierItem } from '@api/models/handbooks';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class HClassifierApiService {
  constructor(private http: HttpClient) {}

  public getAll$(filters: EnterpriesClassifierFilters) {
    return this.http.get<TableOverview<EnterpriesClassifierItem>>('dir-enterprise-classifier', {
      params: buildHttpParams(filters),
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
    });
  }
}
