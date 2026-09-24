import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineApplication, OnlineOffer } from '@api/models/los/application';

@Injectable()
export class ApplicationsDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isLoading = signal<boolean>(true);
  public readonly isOffersLoading = signal<boolean>(false);
  public readonly application = signal<OnlineApplication | null>(null);
  public readonly offers = signal<OnlineOffer[]>([]);

  public getApplication$(applicationId: number) {
    this.isLoading.set(true);
    this.application.set(null);
    this.offers.set([]);

    return this.onlineApiService.getApplication$(applicationId).pipe(
      tap((application) => {
        this.application.set(application);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }

  public getOffers$(applicationId: number) {
    this.isOffersLoading.set(true);

    return this.onlineApiService.getOffers$(applicationId).pipe(
      tap((offers) => {
        this.offers.set(offers.slice(0, 3));
        this.isOffersLoading.set(false);
      }),
      catchError(() => {
        this.offers.set([]);
        this.isOffersLoading.set(false);

        return of([]);
      }),
    );
  }

  public claimLoan$(applicationId: number, offerId: string, isAccepted: boolean) {
    return this.onlineApiService.claimLoan$({ applicationId, offerId, isAccepted }).pipe(
      switchMap(() => this.getApplication$(applicationId)),
    );
  }
}
