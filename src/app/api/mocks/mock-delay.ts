import { delay, Observable, of } from 'rxjs';

export const MOCK_DELAY_MS = 300;

export function mockOf<T>(value: T): Observable<T> {
  return of(structuredClone(value)).pipe(delay(MOCK_DELAY_MS));
}
