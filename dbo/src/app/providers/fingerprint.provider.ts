import { Injectable } from '@angular/core';
import {FingerprintService} from "../shared/lib/fingerprint/fingerprint.service";
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class FingerprintProvider {

  constructor(private fp: FingerprintService) {}

  init() {
    if (environment.production) return
      this.fp.init();
  }
  setUser(userId: string, loginId?: string) {
    if (environment.production) return
    this.fp.setUser(userId, loginId);
  }
  sendEvent(eventName: string) {
    if (environment.production) return
    this.fp.sendEvent(eventName);
  }
}
