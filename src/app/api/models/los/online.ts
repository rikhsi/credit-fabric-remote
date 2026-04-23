export interface OnlineCheckResult {
  is_otp_validated: boolean;
}

export interface OnlineSendOtpResponse {
  phone_number: string;
  pinfl: string;
}

export interface OnlineSendOtpResult {
  is_otp_send: boolean;
}

export interface OnlineCheckOtpResponse {
  phone_number: string;
  pinfl: string;
  otp_code: string;
}

export interface OnlineCheckOtpResult {
  is_otp_validated: boolean;
}
