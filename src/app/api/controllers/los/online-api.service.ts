import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { ClaimLoanPayload, ClaimLoanResult, OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { EligibilityResult, OnlineBranchesResult, OnlineGetInfoResult } from '@api/models/los/online';
import { OnlineCheckOtpResponse, OnlineCheckOtpResult, OnlineSendOtpResponse, OnlineSendOtpResult } from '@api/models/los/otp';
import { StartProcessingPayload, StartProcessingResult } from '@api/models/los/start-processing';
import { SHOW_ERROR_NOTIFICATION } from '@app/constants/base';
import { MOCK_APPLICATIONS_BY_ID, MOCK_APPLICATIONS_LIST, MOCK_OFFERS_BY_ID } from '@api/mocks/applications.mock';
import { environment } from 'src/environments/development';

const MOCK_DELAY_MS = 300;

@Injectable({
  providedIn: 'root',
})
export class OnlineApiService {
  constructor(private http: HttpClient) {}

  public checkValidated$() {
    return this.http.get<OnlineCheckOtpResult>('online/public-offer/is-validated');
  }

  public sendOtp$(payload: OnlineSendOtpResponse) {
    return this.http.post<OnlineSendOtpResult>('online/public-offer/otp-send', payload, {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public checkOtp$(payload: OnlineCheckOtpResponse) {
    return this.http.post<OnlineCheckOtpResult>('online/public-offer/otp-validate', payload, {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public getApplication$(applicationId: number): Observable<OnlineApplication> {
    if (environment.mock) {
      const application = MOCK_APPLICATIONS_BY_ID[applicationId];

      if (!application) {
        return throwError(
          () =>
            new HttpErrorResponse({
              status: 404,
              statusText: 'Not Found',
              error: { message: `Mock application ${applicationId} not found` },
            }),
        ).pipe(delay(MOCK_DELAY_MS));
      }

      return of(structuredClone(application)).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http.get<OnlineApplication>(`online/application/${applicationId}`);
  }

  public getOffers$(applicationId: number): Observable<OnlineOffer[]> {
    if (environment.mock) {
      return of(structuredClone(MOCK_OFFERS_BY_ID[applicationId] ?? [])).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http.get<OnlineOffer[]>(`online/application/${applicationId}/offers`);
  }

  public claimLoan$(payload: ClaimLoanPayload): Observable<ClaimLoanResult> {
    if (environment.mock) {
      return of({
        is_show_toastr: true,
        statusCode: '0',
        statusDesc: payload.isAccepted ? 'Accepted (mock)' : 'Declined (mock)',
        statusTitle: 'OK',
      }).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http.post<ClaimLoanResult>('online/application/claim-loan', payload);
  }

  public checkOneId$() {
    return this.http.get<boolean>('online/application/check-one-id', {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public getApplications$(): Observable<OnlineGetInfoResult[]> {
    if (environment.mock) {
      return of(structuredClone(MOCK_APPLICATIONS_LIST)).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http.get<OnlineGetInfoResult[]>(`online/get-info`);
  }

  public getBranches$() {
    return this.http.get<OnlineBranchesResult>('online/branches');
  }

  public startProcessing$(payload: StartProcessingPayload) {
    return this.http.post<StartProcessingResult>('online/application/start-processing', payload, {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public getFile$(fileId: number) {
    return this.http.get(`attachment/get-attachment/${fileId}`, {
      responseType: 'text',
    });
  }

  public checkEligibility$() {
    return this.http.get<EligibilityResult>('online/eligibility', {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }
}
