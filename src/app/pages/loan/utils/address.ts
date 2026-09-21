import { FLOW_ADDRESS_TYPE_FACT } from '../data/address-type';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

export function createEmptyAddress(addressType: string = null): OnlineStartProcessingAddress {
  return {
    sysAddressTypeId: addressType,
    dirCityId: null,
    dirVillageId: null,
    street: null,
    zipCode: null,
    dirCountryId: 'UZB',
  };
}

/** The flow collects a single address, but the API still expects a list. */
export function buildFlowAddresses(): OnlineStartProcessingAddress[] {
  return [createEmptyAddress(FLOW_ADDRESS_TYPE_FACT)];
}

export function isFlowAddressFilled(item: OnlineStartProcessingAddress): boolean {
  return item.dirCityId != null && item.dirVillageId != null && item.street != null;
}
