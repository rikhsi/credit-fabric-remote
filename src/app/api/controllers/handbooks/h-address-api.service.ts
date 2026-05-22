import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { AddressTypeFilter, AddressTypeItem } from '@api/models/handbooks';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class HAddressApiService {
  constructor(private http: HttpClient) {}

  public getAll$(filters: AddressTypeFilter) {
    return this.http.get<TableOverview<AddressTypeItem>>('sys-address-type', {
      params: buildHttpParams(filters),
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
    });
  }
}
