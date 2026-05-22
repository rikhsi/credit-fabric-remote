import { InjectionToken } from '@angular/core';
import { Language } from './language';
import { createSelectItemByEnum } from '@shared/utils';
import { EnumItemsResult } from '@app/typings/enums';

export const ENUM_ITEMS_TOKEN = new InjectionToken<EnumItemsResult>('ENUM_ITEMS_TOKEN', {
  providedIn: 'root',
  factory: (): EnumItemsResult => ENUM_ITEMS,
});

export const ENUM_ITEMS: EnumItemsResult = {
  language: createSelectItemByEnum(Language, 'language'),
};
