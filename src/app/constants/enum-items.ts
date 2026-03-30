import { InjectionToken } from '@angular/core';
import { Language } from '@constants';
import { createSelectItemByEnum } from '@shared/utils';
import { EnumItemsResult } from '@typings';

export const ENUM_ITEMS_TOKEN = new InjectionToken<EnumItemsResult>('ENUM_ITEMS_TOKEN', {
  providedIn: 'root',
  factory: (): EnumItemsResult => ENUM_ITEMS,
});

export const ENUM_ITEMS: EnumItemsResult = {
  language: createSelectItemByEnum(Language, 'language'),
};
