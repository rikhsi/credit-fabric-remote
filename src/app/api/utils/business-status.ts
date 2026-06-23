export interface BusinessStatusResponse {
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}

const SUCCESS_STATUS_CODES = new Set(['0', '200']);

export function isBusinessStatusError({ statusCode }: BusinessStatusResponse): boolean {
  return !SUCCESS_STATUS_CODES.has(statusCode);
}

export function isValidApplicationId(applicationId: number): boolean {
  return applicationId > 0;
}
