import { StartProcessingAddress } from '@api/models/los/start-processing';

export function createEmptyAddress(): StartProcessingAddress {
  return {
    dirCityId: null,
    dirVillageId: null,
    street: null,
    zipCode: null,
  };
}

export function isFlowAddressFilled(item: StartProcessingAddress | null | undefined): boolean {
  return item != null && item.dirCityId != null && item.dirVillageId != null && item.street != null;
}
