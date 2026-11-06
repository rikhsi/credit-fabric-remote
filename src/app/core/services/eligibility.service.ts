import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { WorkingHoursService } from './working-hours.service';
import { OnlineApiService } from '@api/controllers/los';

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly workingHoursService = inject(WorkingHoursService);
  private initResult$: Observable<boolean> | null = null;

  public readonly isEligible = signal<boolean>(false);

  public refresh$() {
    this.initResult$ = null;

    return this.init$();
  }

  public init$() {
    this.initResult$ ??= this.check$().pipe(
      tap((eligible) => this.isEligible.set(eligible)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.initResult$;
  }

  // Outside working hours applications are closed, so eligibility (and products/branches after it) is not requested.
  private check$(): Observable<boolean> {
    if (!this.workingHoursService.check()) {
      return of(false);
    }

    return this.onlineApiService.checkEligibility$().pipe(
      map(({ eligible }) => eligible),
      catchError(() => of(false)),
    );
  }
}
