import { Observable } from 'rxjs';
import { HandbookApiService } from '@api/controllers/handbooks';
import { HandbookItem, HandbookRequest } from '@app/typings/handbook';
import { SelectOption } from '@app/typings/select';

export function mapHandbookItemsToSelectOptions(items: HandbookItem[]): SelectOption[] {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }));
}

export function fetchHandbookItems(api: HandbookApiService, request: HandbookRequest): Observable<HandbookItem[]> {
  return api.getAll$(request.type, request.params ?? {});
}
