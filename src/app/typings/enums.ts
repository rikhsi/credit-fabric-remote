import { SelectItem } from './item';

export type EnumItemsResult = Record<EnumItem, SelectItem<string>[]>;

export type EnumItem = 'language';
