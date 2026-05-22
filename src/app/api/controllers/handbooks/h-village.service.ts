import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { VillageFilter, VillageItem } from '@api/models/handbooks';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class HVillageService {
  constructor(private http: HttpClient) {}

  public getAll$(filters: VillageFilter) {
    return this.http.get<TableOverview<VillageItem>>('dir-village', {
      params: buildHttpParams(filters),
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
    });
  }
}
