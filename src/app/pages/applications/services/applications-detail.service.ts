import { inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, of, switchMap, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { normalizeOnlineApplication, normalizeOnlineOffers } from '@api/utils';

/** Backend needs a moment to persist the new status after claim-loan. */
const CLAIM_STATUS_REFRESH_DELAY_MS = 5000;

@Injectable()
export class ApplicationsDetailService {
  private readonly onlineApiService = inject(OnlineApiService);

  public readonly isLoading = signal<boolean>(true);
  public readonly isOffersLoading = signal<boolean>(false);
  /** Overlay spinner after claim-loan while the backend status catches up. */
  public readonly isRefreshing = signal<boolean>(false);
  public readonly application = signal<OnlineApplication | null>(null);
  public readonly offers = signal<OnlineOffer[]>([]);

  public getApplication$(applicationId: number) {
    this.isLoading.set(true);
    this.application.set(null);
    this.offers.set([]);

    return this.fetchApplication$(applicationId);
  }

  public getOffers$(applicationId: number) {
    this.isOffersLoading.set(true);

    return this.onlineApiService.getOffers$(applicationId).pipe(
      map((offers) => {
        const product = this.application()?.product;

        return normalizeOnlineOffers(offers, {
          paymentType: product?.paymentType,
          loanAmount: product?.loanAmount,
        }).slice(0, 3);
      }),
      tap((offers) => {
        this.offers.set(offers);
        this.isOffersLoading.set(false);
      }),
      catchError(() => {
        this.offers.set([]);
        this.isOffersLoading.set(false);

        return of([]);
      }),
    );
  }

  public claimLoan$(applicationId: number, offerId: string, isAccepted: boolean, payDay?: number) {
    if (isAccepted && (payDay == null || payDay < 1 || payDay > 25)) {
      // Keep in sync with ModalPayDay PAY_DAY_MAX.
      return throwError(() => new Error('payDay is required'));
    }

    this.isRefreshing.set(true);

    return this.onlineApiService
      .claimLoan$({
        applicationId,
        offerId,
        isAccepted,
        ...(isAccepted ? { payDay } : {}),
      })
      .pipe(
        delay(CLAIM_STATUS_REFRESH_DELAY_MS),
        // Soft refresh: do not clear `application` — that destroys ViewApproved and cancels this stream.
        switchMap(() => this.fetchApplication$(applicationId)),
        tap(() => this.isRefreshing.set(false)),
        catchError((err) => {
          this.isRefreshing.set(false);

          return throwError(() => err);
        }),
      );
  }

  private fetchApplication$(applicationId: number) {
    return this.onlineApiService.getApplication$(applicationId).pipe(
      tap((application) => {
        this.application.set(normalizeOnlineApplication(application));
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }
}
