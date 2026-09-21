import { StartProcessingAddress } from '@api/models/los/start-processing';

export function createEmptyAddress(): StartProcessingAddress {
  return {
    dirCityId: null,
    dirVillageId: null,
    street: null,
    zipCode: null,
  };
}

/** The flow collects a single address, but the API still expects a list. */
export function buildFlowAddresses(): StartProcessingAddress[] {
  return [createEmptyAddress()];
}

export function isFlowAddressFilled(item: StartProcessingAddress): boolean {
  return item.dirCityId != null && item.dirVillageId != null && item.street != null;
}
