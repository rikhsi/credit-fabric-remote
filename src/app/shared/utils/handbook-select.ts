import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TableOverview } from '@api/models/base';
import { buildHttpParams } from '@api/utils';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@app/constants/base';
import { HandbookItem, HandbookRequest } from '@app/typings/handbook';
import { SelectOption } from '@app/typings/select';

export function mapHandbookItemsToSelectOptions(items: HandbookItem[]): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }));
}

export function fetchHandbookItems(http: HttpClient, request: HandbookRequest): Observable<HandbookItem[]> {
  return http
    .get<TableOverview<HandbookItem>>(request.url, {
      context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
      params: buildHttpParams(request.params ?? {}),
    })
    .pipe(map((response) => response.data));
}
