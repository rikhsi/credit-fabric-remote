import { isFlowAddressFilled } from './address';
import { isFinDataFilled } from './finance';
import { StartProcessingPayload } from '@api/models/los/start-processing';

/** Guards against submitting a half-filled application restored from the session. */
export function isStartProcessingPayloadFilled(payload: StartProcessingPayload | null | undefined): payload is StartProcessingPayload {
  if (!payload) {
    return false;
  }

  return (
    payload.loanAmount > 0 &&
    payload.loanTerm > 0 &&
    payload.sysPaymentTypeId != null &&
    isFlowAddressFilled(payload.addresses) &&
    isFinDataFilled(payload.finData)
  );
}
