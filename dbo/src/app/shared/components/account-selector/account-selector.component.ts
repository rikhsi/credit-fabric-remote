import { OnChanges, SimpleChanges } from '@angular/core';
import { Component, Input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { ShortCardNumberPipe } from 'src/app/shared/pipes/short-card-number.pipe';
import { animate, style, transition, trigger } from '@angular/animations';
interface Account {
  id: string;
  accountTitle: string;
  accountType: string;
  altAcctId: string;
  balance: Balance;
  isTransactionAllowed: boolean;
  openDate: string;
  saldoUnlead: number | null;
  status: string;
  value: number;
}
interface Balance {
  amount: number;
  scale: number;
  currency: string;
  logo: any;
}


@Component({
  selector: 'app-account-selector',
  standalone: true,
  imports: [CommonModule, NgxMaskPipe, ShortCardNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountSelectorComponent),
      multi: true
    }
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ],
  template: `
    <div class="account-selector-wrapper">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ label }}</label>
      }

      <div (click)="toggleDropdown()" [style.border]="openDropdown() ? '1px solid #008C79' : '1px solid #EDEDED'"
        [class.opacity-50]="disabled" [class.cursor-not-allowed]="disabled" [class.cursor-pointer]="!disabled"
        class="relative p-5 rounded-[16px] flex justify-between items-center bg-white w-full">

        @if (selectedAccount(); as account) {
          <div class="flex gap-5 items-center">
            @if (account?.balance?.logo && typeof account?.balance?.logo === 'object' &&  account?.balance?.logo?.path) {
              <img [src]="account.balance.logo?.path + account.balance.logo?.name" alt="" width="46" height="46">
            } @else {
              <img class="rounded-full" src="./assets/icons/flag-uz.svg" alt="">
            }
            <div class="flex flex-col gap-[1px]">
              <span class="text-[#191A1D] dark:text-[#ffffff] font-semibold text-[18px]">
                {{ Number(account.balance?.amount) / 100 | mask:'separator' }} {{ account.balance?.currency }}
              </span>
              <span class="text-[#BABABA] text-[14px] font-medium">{{ account.accountType }}</span>
              <p class="text-[#53555A] text-[12px] font-medium">{{ account.altAcctId | shortCardNumber }}</p>
            </div>
          </div>
        } @else {
          <span class="text-[#BABABA] text-[16px]">{{ placeholder }}</span>
        }

        <img src="./assets/icons/down.png" class="mx-4 transition-transform" [class.rotate-180]="openDropdown()" alt="">

        @if (openDropdown()) {
          <div @dropdownAnimation style="box-shadow: 0 5px 20px 0 #00000040"
            class="origin-top z-50 top-full max-h-[328px] overflow-auto absolute left-0 mt-2 w-full rounded-[16px] bg-white">

            @for (account of accounts; track account.id || account.altAcctId) {
              <div class="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                (click)="selectAccount(account); $event.stopPropagation()">
                <div class="flex gap-5 items-center p-4">
                  @if (account?.balance?.logo && typeof account?.balance?.logo === 'object' &&  account?.balance?.logo?.path) {
                    <img class="rounded-full" [src]="account.balance.logo?.path + account.balance.logo?.name" alt="" width="36" height="36">
                  } @else {
                    <img class="rounded-full" src="./assets/icons/flag-uz.svg" alt="">
                  }
                  <div class="flex flex-col gap-[1px]">
                    <span class="text-[#191A1D] dark:text-[#ffffff] font-semibold text-[18px]">
                      {{ Number(account.balance.amount) / 100 | mask:'separator' }} {{ account.balance?.currency }}
                    </span>
                    <span class="text-[#BABABA] text-[14px] font-medium">{{ account.accountType }}</span>
                    <p class="text-[#53555A] text-[12px] font-medium">{{ account.altAcctId | shortCardNumber }}</p>
                  </div>
                </div>
                @if (fromValue) {
                  @if (selectedAccount()?.value === account.value) {
                    <img class="mx-4" src="./assets/icons/check.svg" alt="Selected">
                  }
                } @else {
                  @if (selectedAccount()?.altAcctId === account.altAcctId) {
                    <img class="mx-4" src="./assets/icons/check.svg" alt="Selected">
                  }
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AccountSelectorComponent implements ControlValueAccessor, OnChanges {
  @Input() accounts: Account[] = [];
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() fromValue: boolean = false;

  openDropdown = signal<boolean>(false);
  selectedAccount = signal<Account | null>(null);
  initialValue = signal<string>('');

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };
  disabled = false;

  protected readonly Number = Number;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.accounts?.length && this.selectedAccount() === null && this.initialValue) {
      const found = this.fromValue ? this.accounts.find(a => String(a.value) === String(this.initialValue())) : this.accounts.find(a => a.altAcctId === this.initialValue());
      if (found) this.selectedAccount.set(found);
    }
    // if (changes && changes['accounts']) {
    //   const accounts = changes['accounts'].currentValue;
    //   if (accounts && accounts.length) {
    //     this.selectAccount(accounts[0])
    //   }
    // }
  }
  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.initialValue.set(value);
    // if (!value) {
    //   this.selectedAccount.set(null);
    //   return;
    // }
    //
    // const found = this.accounts.find(acc => acc.altAcctId === value || acc.id === value || acc === value);
    //
    // if (found) {
    //   this.selectedAccount.set(found);
    // }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Component methods
  toggleDropdown(): void {
    if (!this.disabled) {
      this.openDropdown.update(v => !v);
      if (this.openDropdown()) {
        this.onTouched();
      }
    }
  }

  selectAccount(account: Account): void {
    this.selectedAccount.set(account);
    if (this.fromValue) {
      this.onChange(account.value);
    } else {
      this.onChange(account.altAcctId);
    }
    this.openDropdown.set(false);
    this.onTouched();
  }

  // closeDropdown(): void {
  //   this.openDropdown.set(false);
  // }
}
