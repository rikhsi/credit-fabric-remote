import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClaimLoanPayload, ClaimLoanResult, OnlineApplication } from '@api/models/los/application';
import { EligibilityResult, OnlineGetInfoResult } from '@api/models/los/online';
import { OnlineCheckOtpResponse, OnlineCheckOtpResult, OnlineSendOtpResponse, OnlineSendOtpResult } from '@api/models/los/otp';
import { StartProcessingPayload, StartProcessingResult } from '@api/models/los/start-processing';
import { SHOW_ERROR_NOTIFICATION } from '@app/constants/base';

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

  public getApplication$(applicationId: number) {
    return this.http.get<OnlineApplication>(`online/application/${applicationId}`);
  }

  public claimLoan$(payload: ClaimLoanPayload) {
    return this.http.post<ClaimLoanResult>('online/application/claim-loan', payload);
  }

  public checkOneId$() {
    return this.http.get<boolean>('online/application/check-one-id', {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public getApplications$() {
    return this.http.get<OnlineGetInfoResult[]>(`online/get-info`);
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
