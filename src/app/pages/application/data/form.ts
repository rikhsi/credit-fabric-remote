import { OnlineStartProcessingAddress, OnlineStartProcessingExtraInformation, OnlineStartProcessingFinData } from '@api/models/los/online';

export const flowExtraInformationFormModel: OnlineStartProcessingExtraInformation = {
  sectorEconomy: null,
  objectNewFormation: null,
  enterpriseClassfier: null,
  ecologicalImpactCode: null,
};

export const flowAdressFormModel: OnlineStartProcessingAddress = {
  sysAddressTypeId: null,
  dirCityId: null,
  dirVillageId: null,
  street: null,
  zipCode: null,
  dirCountryId: null,
};

export const flowFinanceFormModel: OnlineStartProcessingFinData = {
  dirCompanyActivityId: null,
  activityTerm: null,
  sysMonth1Id: null,
  month1Revenue: null,
  month1Income: null,
  sysMonth2Id: null,
  month2Revenue: null,
  month2Income: null,
  sysMonth3Id: null,
  month3Revenue: null,
  month3Income: null,
};
