import { TableOverview } from '@api/models/base';
import { AddressTypeItem, BranchItem, CityItem, CompanyActivityItem, VillageItem } from '@api/models/handbooks';
import { OnlineBranchesResult } from '@api/models/los/online';

/** Codes shared by online served branches and handbook list (initializer filter). */
export const MOCK_BRANCH_CBS_CODES = [903, 904] as const;

export const MOCK_ONLINE_BRANCHES: OnlineBranchesResult = {
  branches: MOCK_BRANCH_CBS_CODES.map((filialCode) => ({ filialCode })),
};

export const MOCK_HANDBOOK_BRANCHES: TableOverview<BranchItem> = {
  data: [
    {
      id: 'branch-903',
      name: 'Филиал Чилонзор',
      name_tx_id: '',
      name_head: '',
      name_head_tx_id: '',
      created: '2024-01-01',
      updated: null,
      changed_by_username: null,
      is_active: true,
      code: '903',
      dir_city_id: 'city-tashkent',
      cbs_code: 903,
    },
    {
      id: 'branch-904',
      name: 'Филиал Юнусабад',
      name_tx_id: '',
      name_head: '',
      name_head_tx_id: '',
      created: '2024-01-01',
      updated: null,
      changed_by_username: null,
      is_active: true,
      code: '904',
      dir_city_id: 'city-tashkent',
      cbs_code: 904,
    },
  ],
};

export const MOCK_CITIES: TableOverview<CityItem> = {
  data: [
    {
      id: 'city-tashkent',
      name: 'Ташкент',
      name_tx_id: '',
      cbs_code: '26',
      changed_by_username: '',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-01'),
      dir_region_id: 'region-tashkent',
      is_active: true,
    },
  ],
};

export const MOCK_VILLAGES: TableOverview<VillageItem> = {
  data: [
    {
      id: 'village-1',
      name: 'Чилонзор',
      name_tx_id: '',
      changed_by_username: '',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-01'),
      dir_city_id: 'city-tashkent',
      is_active: true,
    },
  ],
};

export const MOCK_COMPANY_ACTIVITIES: TableOverview<CompanyActivityItem> = {
  data: [
    { id: '47110', name: 'Retail trade' },
    { id: '62010', name: 'IT services' },
  ],
};

export const MOCK_ADDRESS_TYPES: TableOverview<AddressTypeItem> = {
  data: [
    {
      id: 'actual',
      name: 'Фактический',
      name_tx_id: '',
      changed_by_username: '',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-01'),
      is_active: true,
    },
    {
      id: 'legal',
      name: 'Юридический',
      name_tx_id: '',
      changed_by_username: '',
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-01'),
      is_active: true,
    },
  ],
};
