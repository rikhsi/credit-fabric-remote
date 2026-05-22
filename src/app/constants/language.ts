import { en_US, ru_RU } from 'ng-zorro-antd/i18n';
import { uz_UZ } from '@core/configs/zorro-uz.locale';

export enum Language {
  Uzbek = 'uz',
  Russian = 'ru',
  English = 'en',
}

export const DEFAULT_LANGUAGE: Language = Language.Russian;

export const NZ_LOCALES = {
  [Language.Uzbek]: uz_UZ,
  [Language.Russian]: ru_RU,
  [Language.English]: en_US,
} as const;

export const LANGUAGE_CONTENT: Record<string, string> = {
  ru: 'ru',
  uz: 'uz',
  en: 'en',
};

export const LANGUAGE_FLAG: Record<string, string> = {
  [Language.English]: 'c:enFlag',
  [Language.Russian]: 'c:ruFlag',
  [Language.Uzbek]: 'c:uzFlag',
};
