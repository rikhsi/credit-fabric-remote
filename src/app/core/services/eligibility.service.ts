import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private readonly onlineApiService = inject(OnlineApiService);
  private initResult$: Observable<boolean> | null = null;

  public readonly isEligible = signal<boolean>(false);

  public init$() {
    this.initResult$ ??= this.onlineApiService.checkEligibility$().pipe(
      map(({ eligible }) => eligible),
      catchError(() => of(false)),
      tap((eligible) => this.isEligible.set(eligible)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.initResult$;
  }
}
