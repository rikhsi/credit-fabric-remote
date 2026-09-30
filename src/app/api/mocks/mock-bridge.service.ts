import { Injectable } from '@angular/core';
import { MOCK_DELAY_MS } from './mock-delay';
import { environment } from 'src/environments/development';
import { NativeEvent, NativeEventName, NativeSignedData } from '@app/typings/bridge';
import { BridgeService } from '@core/services/bridge.service';

const MOCK_SIGN_DELAY_MS = MOCK_DELAY_MS * 4;

/**
 * Stands in for the native `window.Bridge` when `environment.mock` is on:
 * `signBase64File` is emulated by posting the `onSigned` window message back after a delay.
 */
@Injectable()
export class MockBridgeService extends BridgeService {
  public override hasBridge(): boolean {
    return true;
  }

  public override onSignClick(file: string): void {
    const signedPdfBase64 = file.replace(/^data:[^,]*,/, '');

    const message: NativeEvent<NativeSignedData> = {
      event: environment.projectTag,
      data: {
        event_name: NativeEventName.Signed,
        status: 'success',
        data: {
          signedPdfBase64,
          completedAt: new Date().toISOString(),
          confirmationMethods: 'MOCK',
        },
      },
    };

    setTimeout(() => window.postMessage(message, window.location.origin), MOCK_SIGN_DELAY_MS);
  }
}
