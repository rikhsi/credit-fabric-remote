import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TableOverview } from '@api/models/base';
import { CountryFilters, CountryItem } from '@api/models/handbooks';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class HCountryApiService {
  constructor(private http: HttpClient) {}

  public getAll$(filters: CountryFilters) {
    return this.http.get<TableOverview<CountryItem>>('dir-country', {
      params: buildHttpParams(filters),
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
    });
  }
}
