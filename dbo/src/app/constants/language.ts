export const languages = [
    { value: 'RUS', label: 'Русский', key: 'ru' },
    { value: 'UZB', label: 'O’zbek', key: 'uz-Latn' },
    { value: 'KRL', label: 'Ўзбек Кирил', key: 'uz-Cyrl' },
    { value: 'ENG', label: 'English', key: 'en' },
    { value: 'CHN', label: '中文', key: 'zh' },
  ];

export type languageTypes = 'RUS'|'UZB'|'KRL' |'ENG'|'CHN';
export function handleFirebaseLanguage(lang:'RUS'|'UZB'|'KRL' |'ENG'|'CHN'):'UZL' | 'UZK' | 'RU' | 'EN' |'CHN' {
    switch(lang)  {
      case 'RUS':
        return 'RU';
    case 'UZB':
        return 'UZL';
    case 'KRL':
        return 'UZK';  
    case 'ENG':
        return 'EN';
    case 'CHN':
        return 'CHN';
    default:
        return 'UZL' 
    }
}