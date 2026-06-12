import { FLOW_REQUIRED_ADDRESS_TYPES } from '../data/address-type';
import { OnlineBorrowerAddress } from '@api/models/los/application';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

function toFormAddressValue(value: string | null | undefined): string | null {
  if (value == null || value === '') {
    return null;
  }

  return value;
}

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

export function mapBorrowerAddressesToForm(borrowerAddresses?: OnlineBorrowerAddress[] | null): OnlineStartProcessingAddress[] {
  const base = buildRequiredAddresses();

  if (!borrowerAddresses?.length) {
    return base;
  }

  return base.map((emptyAddress) => {
    const source = borrowerAddresses.find((item) => item.sysAddressTypeId === emptyAddress.sysAddressTypeId);

    if (!source) {
      return emptyAddress;
    }

    return {
      sysAddressTypeId: emptyAddress.sysAddressTypeId,
      dirCountryId: toFormAddressValue(source.dirCountryId) ?? emptyAddress.dirCountryId,
      dirCityId: toFormAddressValue(source.dirCityId),
      dirVillageId: toFormAddressValue(source.dirVillageId),
      street: toFormAddressValue(source.street),
      zipCode: toFormAddressValue(source.zipCode),
    };
  });
}

export function isFlowAddressFilled(item: OnlineStartProcessingAddress): boolean {
  return item.dirCityId != null && item.dirVillageId != null && item.street != null && !!item.zipCode;
}
