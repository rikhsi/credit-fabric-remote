import {ElementRef, HostListener, OnChanges, SimpleChanges} from '@angular/core';
import { Component, Input, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShortCardNumberPipe } from 'src/app/shared/pipes/short-card-number.pipe';
import { animate, style, transition, trigger } from '@angular/animations';
import {AccountV2DTO} from "../../interfaces/applications.interface";

@Component({
  selector: 'app-account-selector-v2',
  standalone: true,
  imports: [CommonModule, ShortCardNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountSelectorV2Component),
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
        class="relative p-5 rounded-[16px] flex justify-between items-center bg-white dark:bg-[#1E1E1E] w-full">

        @if (selectedAccount(); as account) {
          <div class="flex gap-5 items-center">
            <img class="rounded-full" [src]="account.currency_logo_url" alt="">
            <div class="flex flex-col gap-[1px]">
              <span class="text-[#171717] dark:text-[#ffffff]">
                <span class="text-[18px] font-[600]">{{ getSaldoInteger(account.saldo) }}</span><span class="text-[16px] font-[400]">{{ getSaldoDecimal(account.saldo) }} {{ account.code_currency }}</span>
              </span>
              <span class="text-[14px] text-[#A3A3A3] font-[500]">{{ account.account_type }}</span>
              <p class="text-[14px] text-[#5C5C5C] font-[500]">{{ account.text | shortCardNumber }}</p>
            </div>
          </div>
        } @else {
          <span class="text-[#BABABA] text-[16px]">{{ placeholder }}</span>
        }

        <img src="./assets/icons/down.png" class="mx-4 transition-transform" [class.rotate-180]="openDropdown()" alt="">

        @if (openDropdown()) {
          <div @dropdownAnimation style="box-shadow: 0 5px 20px 0 #00000040"
            class="origin-top z-50 top-full absolute left-0 mt-2 w-full rounded-[16px] bg-white dark:bg-[#1E1E1E] overflow-hidden">
            <div class="max-h-[328px] overflow-auto my-[8px]">

            @for (account of dataList; track account.value) {
              <div class="flex items-center justify-between mx-[8px] rounded-[16px] hover:bg-[#F5F5F5] dark:hover:bg-gray-800 transition-colors h-[84px]"
                (click)="selectAccount(account); $event.stopPropagation()">
                <div class="flex gap-5 items-center px-4">
                  <img class="rounded-full" [src]="account.currency_logo_url" alt="">
                  <div class="flex flex-col gap-[1px]">
                    <span class="text-[18px] text-[#171717] dark:text-[#ffffff]">
                      <span class="font-[600]">{{ getSaldoInteger(account.saldo) }}</span><span class="font-[400]">{{ getSaldoDecimal(account.saldo) }}</span>
                      <span class="font-[400]"> {{ account.code_currency }}</span>
                    </span>
                    <span class="text-[14px] text-[#A3A3A3] font-[500]">{{ account.account_type }}</span>
                    <p class="text-[14px] text-[#5C5C5C] font-[500]">{{ account.text | shortCardNumber }}</p>
                  </div>
                </div>

                @if (selectedAccount()?.value === account.value) {
                  <div class="hidden dark:block">
                    <img class="mx-4" src="assets/icons/check_white.svg" alt="">
                  </div>
                  <div class="block dark:hidden">
                    <img class="mx-4" src="assets/icons/check.svg" alt="">
                  </div>
                }
              </div>
            }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AccountSelectorV2Component implements ControlValueAccessor, OnChanges {
  @Input() dataList: AccountV2DTO[] = [];
  @Input() placeholder: string = '';
  @Input() label: string = '';

  constructor(private elementRef: ElementRef) { }

  openDropdown = signal<boolean>(false);
  selectedAccount = signal<AccountV2DTO | null>(null);
  initialValue = signal<string>('');

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };
  disabled = false;

  protected readonly Number = Number;

  getSaldoInteger(saldo: string | number): string {
    const num = Number(saldo) / 100;
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.floor(num)).replace(/,/g, ' ');
  }

  getSaldoDecimal(saldo: string | number): string {
    return (Number(saldo) / 100 % 1).toFixed(2).slice(1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataList?.length && this.selectedAccount() === null && this.initialValue) {
      const found = this.dataList.find(a => a.value === this.initialValue());
      if (found) this.selectedAccount.set(found);
    }
  }

  writeValue(value: any): void {
    this.initialValue.set(value);
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

  toggleDropdown(): void {
    if (!this.disabled) {
      this.openDropdown.update(v => !v);
      if (this.openDropdown()) {
        this.onTouched();
      }
    }
  }

  selectAccount(account: AccountV2DTO): void {
    this.selectedAccount.set(account);
    this.onChange(account.value); //
    this.openDropdown.set(false);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    if (!clickedInside && this.openDropdown()) {
      this.openDropdown.set(false);
      this.onTouched();
    }
  }

  // closeDropdown(): void {
  //   this.openDropdown.set(false);
  // }
}
