import { ShortApplicationResult } from '@api/models/los/application';

export interface BusinessStatusResponse {
  statusCode: string;
  statusDesc: string;
  statusTitle: string;
}

export function isBusinessStatusError({ statusCode }: BusinessStatusResponse): boolean {
  return statusCode !== '0';
}

export function isValidApplicationId(applicationId: number): boolean {
  return applicationId > 0;
}

export function isShortApplicationError(result: ShortApplicationResult): boolean {
  return !isValidApplicationId(result.applicationId) || isBusinessStatusError(result);
}
