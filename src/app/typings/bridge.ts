import { OnlineSigningResultSigner } from '@api/models/los/signing-document';

export interface NativeEvent<T> {
  event: string;
  data: NativeEventData<T>;
}

export interface NativeEventData<T> {
  event_name: string;
  status: string;
  data: T;
}

/** Native callback `event_name` values handled by `BridgeService`. */
export const NativeEventName = {
  TokenRefresh: 'onTokenRefresh',
  ChangeTheme: 'onChangeTheme',
  Signed: 'onSigned',
} as const;

/** Data native sends back after `signBase64File` (`event_name: 'onSigned'`). */
export interface NativeSignedData {
  signedPdfBase64: string;
  completedAt?: string;
  confirmationMethods?: string;
  status?: string;
  signers?: OnlineSigningResultSigner[];
}
