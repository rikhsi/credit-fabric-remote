export interface BillAccount {
  account: string;
  balance: number;
  currency: string;
  name: string;
}

export function maskAccountNumber(account: string | null | undefined): string {
  if (!account) {
    return '';
  }

  if (account.length <= 8) {
    return account;
  }

  return `${account.slice(0, 5)}・・${account.slice(-3)}`;
}

export function toReadonlyAccountItems(accountNo: string | null | undefined): BillAccount[] {
  if (!accountNo) {
    return [];
  }

  return [
    {
      account: accountNo,
      currency: 'UZS',
      name: '',
      balance: 0,
    },
  ];
}
