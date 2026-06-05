export interface OnlineSendOtpResponse {
  phoneNumber: string;
  pinfl: string;
}

export interface OnlineSendOtpResult {
  errorCode: string;
  isOtpSent: boolean;
}

export interface OnlineCheckOtpResponse {
  phoneNumber: string;
  pinfl: string;
  otpCode: string;
}

export interface OnlineCheckOtpResult {
  errorCode: string;
  isOtpValidated: boolean;
}
