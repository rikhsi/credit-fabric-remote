export interface CurrencyAndAccountResponseTypes {
  accountResponseType: AccountResponseType[];
  currencyList: CurrencyList[];
}

export interface AccountResponseType {
  key: string;
  value: string;
}

export interface CurrencyList {
  name: string;
  code: string;
  scale: number;
  logo: Logo;
}

export interface Logo {
  contentType: string;
  path: string;
  name: string;
  ext: string;
}
