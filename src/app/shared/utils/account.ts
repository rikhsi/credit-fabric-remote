import { OnlineAccount } from '@api/models/los/account';

export function maskAccountNumber(account: string | null | undefined): string {
  if (!account) {
    return '';
  }

  if (account.length <= 8) {
    return account;
  }

  return `${account.slice(0, 5)}・・${account.slice(-3)}`;
}

export function toReadonlyAccountItems(accountNo: string | null | undefined): OnlineAccount[] {
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

/** Finds the account matching the saved accountNo among the fetched accounts to display it readonly. */
export function matchSelectedAccount(accounts: OnlineAccount[], accountNo: string | null | undefined): OnlineAccount[] {
  if (!accountNo) {
    return [];
  }

  const matched = accounts.find((item) => item.account === accountNo);

  return matched ? [matched] : toReadonlyAccountItems(accountNo);
}
