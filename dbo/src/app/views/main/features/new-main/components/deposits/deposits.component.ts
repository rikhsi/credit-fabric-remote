import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { NgIf } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DepositService } from "../../../deposits/services/deposit.service";

@Component({
  selector: 'app-deposits',
  imports: [NgIf, NgxMaskPipe],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      @for (account of deposits(); track account) {
        <div class="px-4 py-6 bg-surface-2 border border-custom-border relative flex justify-between items-center rounded-[22px]">
          <div class="flex items-center space-x-5">
            <img src="./assets/new-icons/uzb.svg" alt="#">
            <div class="flex flex-col space-y-2">
              <span *ngIf="account.saldo as balance"
                    class="font-semibold text-[18px] leading-5 text-custom-primary">
                {{ balance.amount / 100 | mask:'separator' }} {{ balance.currency }}
              </span>
              <span class="text-custom-secondary text-sm font-medium leading-4">
                {{ account.nameAcc }}
              </span>
            </div>
          </div>
          <span class="text-custom-secondary text-xs font-medium leading-[18px] font-inter">
            {{ account.createDate }}
          </span>
          <button
            class="absolute bottom-[10px] right-[20px] bg-transparent border-none p-0 cursor-pointer"
            (click)="onPinClick($event, account)">
            <img
              width="20"
              height="20"
              [src]="account.hasPinned ? './assets/new-icons/pin-active.svg' : './assets/new-icons/pin-inactive.svg'"
              alt="pin">
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent {
  deposits = input<any[]>();
  refreshDeposits = output<void>();

  private depositService = inject(DepositService);
  private destroyRef = inject(DestroyRef);

  onPinClick(event: Event, account: any): void {
    event.stopPropagation();
    const contractId = String(account.id);
    const accountNumber = account.account;

    const request$ = account.hasPinned
      ? this.depositService.unpinDepositContract(contractId, accountNumber)
      : this.depositService.pinDepositContract(contractId, accountNumber, account.codeFilial ?? '');

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.refreshDeposits.emit(),
      error: (err) => console.error('pin/unpin error:', err),
    });
  }
}