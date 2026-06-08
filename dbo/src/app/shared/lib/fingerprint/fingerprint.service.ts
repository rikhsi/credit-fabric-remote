import { Injectable } from '@angular/core';
import {environment} from "../../../../environments/environment";

declare var Fingerprint: any;

@Injectable({ providedIn: 'root' })
export class FingerprintService {

  init(): void {

    const statusCallback = {
      onResult: (state: string) => {
        console.log('[FP] State:', state);
      },
      onInitiated: () => {
        console.log('[FP] READY');
      }
    };

    Fingerprint.initSdkURL(environment.proxyUrl, statusCallback);

    /////// with proxy
    // const sdkUrl = environment.proxyUrl.startsWith('/') && typeof window !== 'undefined'  ? `${window.location.origin}${environment.proxyUrl}`: environment.proxyUrl;
    // Fingerprint.initSdkURL(sdkUrl, statusCallback);
  }

  setUser(userId: string, login?: string) {
    console.log('[FP] SetUser:', userId);
    Fingerprint.setUserId(userId);
    if (login) Fingerprint.setLoginId(login);
  }

  sendPayment(transactionId: string) {
    Fingerprint.sendDataManual(
      'SESSION_DATA_PAY',
      transactionId,
      (err: any) => console.error(err)
    );
  }
  sendEvent(eventName: string) {
    console.log('[FP] SendEvent:', eventName);
    Fingerprint.sendDataManual(
      eventName,
      (err: any) => console.error(err)
    );
  }
}
