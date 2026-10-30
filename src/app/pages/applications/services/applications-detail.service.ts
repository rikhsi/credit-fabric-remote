import { inject, Injectable, signal } from '@angular/core';
import { translate } from '@jsverse/transloco';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { OnlineApiService } from '@api/controllers/los';
import { ApplicationStatus, OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { normalizeOnlineApplication, normalizeOnlineOffers } from '@api/utils';
import { ToastService } from '@core/services/toast.service';

@Injectable()
export class ApplicationsDetailService {
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly toast = inject(ToastService);

  public readonly isLoading = signal<boolean>(true);
  public readonly isRefreshing = signal<boolean>(false);
  public readonly isOffersLoading = signal<boolean>(false);
  public readonly application = signal<OnlineApplication | null>(null);
  public readonly offers = signal<OnlineOffer[]>([]);
  /**
   * `GET online/application/:id` failed for an approved application, so only offers are shown.
   * Branch, phone and offer end date are unknown in this mode.
   */
  public readonly isOffersOnly = signal<boolean>(false);

  /**
   * `fallbackStatus` is the status from the applications list. When the application request fails
   * and the status is approved, the offers are still loaded and shown on their own.
   */
  public getApplication$(applicationId: number, fallbackStatus?: string | null) {
    this.isLoading.set(true);
    this.isOffersOnly.set(false);
    this.application.set(null);
    this.offers.set([]);

    return this.fetchApplication$(applicationId).pipe(
      map((): void => undefined),
      catchError((err) =>
        fallbackStatus === ApplicationStatus.OnDecision ? this.loadOffersOnly$(applicationId) : throwError(() => err),
      ),
      catchError((err) => {
        this.isLoading.set(false);
        this.showServiceUnavailable();

        return throwError(() => err);
      }),
    );
  }

  /** Soft refresh: keep the current application on screen while the spinner runs. */
  public reload$(applicationId: number) {
    return this.fetchApplication$(applicationId);
  }

  /** Emits `null` when the request fails. */
  public getOffers$(applicationId: number): Observable<OnlineOffer[] | null> {
    this.isOffersLoading.set(true);

    return this.onlineApiService.getOffers$(applicationId).pipe(
      map((offers) => normalizeOnlineOffers(offers).slice(0, 3)),
      tap((offers) => {
        this.offers.set(offers);
        this.isOffersLoading.set(false);
      }),
      catchError(() => {
        this.offers.set([]);
        this.isOffersLoading.set(false);
        this.showServiceUnavailable();

        return of(null);
      }),
    );
  }

  /**
   * Emits `true` when the application was reloaded after the claim,
   * `false` when the claim went through but the application could not be loaded.
   */
  public claimLoan$(applicationId: number, offerId: string, isAccepted: boolean, payDay?: number): Observable<boolean> {
    if (isAccepted && (payDay == null || payDay < 1 || payDay > 25)) {
      // Keep in sync with ModalPayDay PAY_DAY_MAX.
      return throwError(() => new Error('payDay is required'));
    }

    return this.onlineApiService
      .claimLoan$({
        applicationId,
        offerId,
        isAccepted,
        ...(isAccepted ? { payDay } : {}),
      })
      .pipe(
        // Soft refresh: do not clear `application` — that destroys ViewApproved and cancels this stream.
        switchMap(() =>
          this.isOffersOnly()
            ? of(false)
            : this.fetchApplication$(applicationId).pipe(
                map(() => true),
                catchError(() => of(false)),
              ),
        ),
      );
  }

  private fetchApplication$(applicationId: number) {
    return this.onlineApiService.getApplication$(applicationId).pipe(
      tap((application) => {
        this.application.set(normalizeOnlineApplication(application));
        this.isOffersOnly.set(false);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);

        return throwError(() => err);
      }),
    );
  }

  private loadOffersOnly$(applicationId: number) {
    this.isLoading.set(true);

    return this.onlineApiService.getOffers$(applicationId).pipe(
      map((offers) => normalizeOnlineOffers(offers).slice(0, 3)),
      tap((offers) => {
        if (!offers.length) {
          throw new Error('No offers for the approved application');
        }

        this.offers.set(offers);
        this.isOffersOnly.set(true);
        this.isLoading.set(false);
      }),
      map((): void => undefined),
    );
  }

  private showServiceUnavailable(): void {
    this.toast.error(translate('toast.service_unavailable.title'), translate('toast.service_unavailable.description'));
  }
}
