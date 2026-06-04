import { FlowAddressForm } from '../models/form';
import { OnlineAdress, OnlineApplicationAddress } from '@api/models/los/online';

export const FLOW_ADDRESS_TYPE_FACT = 'FACT';
export const FLOW_ADDRESS_TYPE_POST = 'POST';
export const FLOW_ADDRESS_TYPE_JUR = 'JUR';

export const FLOW_REQUIRED_ADDRESS_TYPES = [FLOW_ADDRESS_TYPE_FACT, FLOW_ADDRESS_TYPE_POST, FLOW_ADDRESS_TYPE_JUR] as const;

export type FlowAddressTypeId = (typeof FLOW_REQUIRED_ADDRESS_TYPES)[number];

function createEmptyAddress(addressType: FlowAddressTypeId): FlowAddressForm {
  return {
    addressType,
    city: null,
    address: null,
    street: null,
    postalCode: null,
  };
}

export function buildRequiredAddresses(): FlowAddressForm[] {
  return FLOW_REQUIRED_ADDRESS_TYPES.map((addressType) => createEmptyAddress(addressType));
}

export function isFlowAddressFilled(item: FlowAddressForm): boolean {
  return item.city != null && item.street != null && !!item.address && !!item.postalCode;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

function mapApiAddressItem(item: OnlineApplicationAddress | OnlineAdress): Partial<FlowAddressForm> | null {
  const addressType =
    'addressType' in item && item.addressType != null
      ? String(item.addressType)
      : 'sysAddressTypeId' in item
        ? item.sysAddressTypeId
        : null;

  if (!addressType || !FLOW_REQUIRED_ADDRESS_TYPES.includes(addressType as FlowAddressTypeId)) {
    return null;
  }

  if ('dirCityId' in item) {
    return {
      addressType,
      city: toNumber(item.dirCityId),
      street: toNumber(item.dirVillageId),
      address: item.street ?? null,
      postalCode: item.zipCode ?? null,
    };
  }

  return {
    addressType,
    city: item.city ?? null,
    address: item.address ?? null,
    street: item.street ?? null,
    postalCode: item.postalCode ?? null,
  };
}

export function mergeRequiredAddresses(apiAddresses: (OnlineApplicationAddress | OnlineAdress)[] = []): FlowAddressForm[] {
  return buildRequiredAddresses().map((template) => {
    const fromApi = apiAddresses.map(mapApiAddressItem).find((item) => item?.addressType === template.addressType);

    return { ...template, ...fromApi };
  });
}
