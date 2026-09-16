import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isEligible = signal<boolean>(false);

  public init$() {
    return this.onlineApiService.checkEligibility$().pipe(
      map(({ eligible }) => eligible),
      catchError(() => of(false)),
      tap((eligible) => this.isEligible.set(eligible)),
    );
  }
}
