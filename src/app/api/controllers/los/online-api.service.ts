import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OnlineApplication, ShortApplicationPayload, ShortApplicationResult } from '@api/models/los/application';
import { OnlineGetInfoResult } from '@api/models/los/online';
import { OnlineCheckOtpResponse, OnlineCheckOtpResult, OnlineSendOtpResponse, OnlineSendOtpResult } from '@api/models/los/otp';
import { OnlineCreateApplicationPayload, OnlineCreateApplicationResult } from '@api/models/los/start-processing';
import { buildHttpParams } from '@api/utils';
import { SHOW_ERROR_NOTIFICATION } from '@app/constants/base';

@Injectable({
  providedIn: 'root',
})
export class OnlineApiService {
  constructor(private http: HttpClient) {}

  public checkValidated$(pinfl: string) {
    return this.http.get<OnlineCheckOtpResult>('online/public-offer/is-validated', {
      params: buildHttpParams({ pinfl }),
    });
  }

  public sendOtp$(payload: OnlineSendOtpResponse) {
    return this.http.post<OnlineSendOtpResult>('online/public-offer/otp-send', payload);
  }

  public checkOtp$(payload: OnlineCheckOtpResponse) {
    return this.http.post<OnlineCheckOtpResult>('online/public-offer/otp-validate', payload);
  }

  public getApplication$(applicationId: number) {
    return this.http.get<OnlineApplication>(`online/application/${applicationId}`);
  }

  public getApplications$() {
    return this.http.get<OnlineGetInfoResult[]>(`online/get-info`);
  }

  public createApplication$(payload: OnlineCreateApplicationPayload) {
    return this.http.post<OnlineCreateApplicationResult>('online/application/start-processing', payload);
  }

  public createShortApplication$(payload: ShortApplicationPayload) {
    return this.http.post<ShortApplicationResult>('short-application-create', payload, {
      context: new HttpContext().set(SHOW_ERROR_NOTIFICATION, false),
    });
  }

  public getFile$(fileId: number) {
    return this.http.get(`attachment/get-attachment/${fileId}`, {
      responseType: 'text',
    });
  }
}
