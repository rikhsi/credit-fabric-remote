import { FLOW_REQUIRED_ADDRESS_TYPES } from '../data/address-type';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

function createEmptyAddress(addressType: string): OnlineStartProcessingAddress {
  return {
    sysAddressTypeId: addressType,
    dirCityId: null,
    dirVillageId: null,
    street: null,
    zipCode: null,
    dirCountryId: 'UZB',
  };
}

export function buildRequiredAddresses(): OnlineStartProcessingAddress[] {
  return FLOW_REQUIRED_ADDRESS_TYPES.map((addressType) => createEmptyAddress(addressType));
}

export function isFlowAddressFilled(item: OnlineStartProcessingAddress): boolean {
  return item.dirCityId != null && item.dirVillageId != null && item.street != null && !!item.zipCode;
}
