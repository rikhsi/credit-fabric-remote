import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  OnlineCheckOtpResponse,
  OnlineCheckOtpResult,
  OnlineCheckResult,
  OnlineSendOtpResponse,
  OnlineSendOtpResult,
} from '@api/models/los';
import { buildHttpParams } from '@api/utils';

@Injectable({
  providedIn: 'root',
})
export class OnlineApiService {
  constructor(private http: HttpClient) {}

  public checkValidated$(pinfl: string) {
    return this.http.get<OnlineCheckResult>('online/public-offer/is-validated', {
      params: buildHttpParams({ pinfl }),
    });
  }

  public sendOtp$(payload: OnlineSendOtpResponse) {
    return this.http.post<OnlineSendOtpResult>('online/public-offer/otp-send', payload);
  }

  public checkOtp$(payload: OnlineCheckOtpResponse) {
    return this.http.post<OnlineCheckOtpResult>('online/public-offer/otp-validate', payload);
  }
}
