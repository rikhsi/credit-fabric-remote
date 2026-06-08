import {
  Component,
  input,
  output,
  inject,
  computed,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DepositDetailsModalComponent } from '../../modals/deposit-details-modal/deposit-details-modal.component';
import { DepositService } from '../../../services/deposit.service';

@Component({
  selector: 'app-deposite-table-item',
  imports: [TranslateModule],
  template: `
    <div

      (click)="navigateAccount()"
      class="grid items-center gap-x-4 py-4 cursor-pointer transition-colors duration-150 hover:bg-surface-1 border-b border-custom-soft-200 last:border-b-0"
      [class.opacity-30]="activeTab() == 'closed'"
      style="grid-template-columns:320px 240px minmax(240px, 1.5fr) 40px 40px 40px">

      <!-- Col 1: Logo + Name -->
      <div class="flex items-center gap-5 min-w-0">
        <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
          @if (logoUrl) {
            <img [src]="logoUrl" width="36" height="36" class="w-9 h-9 object-cover" alt="" />
          } @else {
            <div class="w-9 h-9 rounded-full bg-surface-1 flex items-center justify-center text-custom-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
          }
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-custom-primary truncate">{{ dataItem().name }}</span>
          @if (activeTab() == 'closed') {
            <span class="text-xs text-red-500 mt-0.5">{{ 'deposits.blocked' | translate }}</span>
          }
        </div>
      </div>

      <!-- Col 2: Account Number -->
      <div class="flex items-center min-w-0">
        @if (!isHidden()) {
          <span class="text-sm text-custom-primary tracking-wide">{{ dataItem().account }}</span>
        } @else {
          <span class="inline-flex items-center gap-1 text-sm text-custom-primary">
            <span>{{ dataItem().account?.slice(0, 5) }}</span>
            <span class="tracking-widest text-xs text-custom-primary">••••</span>
            <span>{{ dataItem().account?.slice(-3) }}</span>
          </span>
        }
      </div>

      <!-- Col 3: Balance -->
      <div class="flex items-center min-w-0">
        @if (!isHidden() && dataItem().depSaldo) {
          <span class="text-[15px] font-bold text-custom-primary whitespace-nowrap">
            {{ integerPart(dataItem().depSaldo?.amount) }}.{{ decimalPart(dataItem().depSaldo?.amount) }}
            <span class="ml-1">{{ dataItem().depSaldo.currency }}</span>
          </span>
        } @else if (isHidden()) {
          <span class="text-sm tracking-widest text-custom-secondary">•••••••••••</span>
        }
      </div>

      <!-- Col 4: Pin -->
      @if(dataItem().state == 'APPROVE') {
           <button
        class="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer hover:bg-surface-1 flex-shrink-0"
        (click)="onPinClick($event)"
        [disabled]="activeTab() == 'closed'"
        [title]="'deposits.pin' | translate">
        @if (dataItem().hasPinned) {
          <img width="20" src="assets/new-icons/pin-active.svg" alt="pinned" />
        } @else {
          <img width="20" src="assets/new-icons/pin-inactive.svg" alt="pin" />
        }
      </button>
      }


      <!-- Col 5: Visibility Toggle -->
      <button

        class="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer hover:bg-surface-1 flex-shrink-0"
        (click)="toggleVisibility($event)"
        [disabled]="activeTab() == 'closed'"
        [title]="'deposits.show_hide' | translate">
        @if (!isHidden()) {
          <img width="20" src="assets/new-icons/eye-off.svg" alt="hide" />
        } @else {
          <img width="20" src="assets/new-icons/eye.svg" alt="show" />
        }
      </button>

      <!-- Col 6: Detail Info -->
<!--      <button-->
<!--        class="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent cursor-pointer hover:bg-surface-1 flex-shrink-0 text-custom-secondary hover:text-[#00A38D] transition-colors"-->
<!--        (click)="openDetails($event)">-->
<!--        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--          <path d="M9.08333 12.4167V9.08333M9.08333 5.75H9.09167M17.4167 9.08333C17.4167 13.6857 13.6857 17.4167 9.08333 17.4167C4.48096 17.4167 0.75 13.6857 0.75 9.08333C0.75 4.48096 4.48096 0.75 9.08333 0.75C13.6857 0.75 17.4167 4.48096 17.4167 9.08333Z"-->
<!--            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--        </svg>-->
<!--      </button>-->

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositeTableItemComponent{
  dataItem = input.required<any>();
  hiddenAccounts = input<Set<string>>(new Set());
  activeTab = input.required<'active' | 'closed'>()

  pinClick = output<{ id: string; altAcctId: string }>();
  visibilityToggle = output<string>();
  requisite = output<{ altAcctId: string; id: string }>();
  statementNavigate = output<string>();

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private depositService = inject(DepositService);

  isHidden = computed(() => this.hiddenAccounts().has(this.dataItem().contractNumber));



  navigateAccount(): void {
    this.router.navigate(['/deposits/details', this.dataItem().id]);
  }

  onPinClick(event: Event): void {
    event.stopPropagation();
    const item = this.dataItem();
    const contractId = String(item.contractId);
    const accountNumber = item.account;

    const request$ = item.hasPinned
      ? this.depositService.unpinDepositContract(contractId, accountNumber)
      : this.depositService.pinDepositContract(contractId, accountNumber, item.codeFilial ?? '');

    request$.subscribe({
      next: () => this.pinClick.emit({ id: item.id, altAcctId: item.contractNumber }),
      error: (err) => console.error('pin/unpin error:', err),
    });
  }

  toggleVisibility(event: Event): void {
    event.stopPropagation();
    this.visibilityToggle.emit(this.dataItem().contractNumber);
  }

  openDetails(event: Event): void {
    event.stopPropagation();
    this.dialog.open(DepositDetailsModalComponent, {
      data: this.dataItem(),
      width: '475px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  integerPart(balance: any): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance: any): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  get logoUrl(): string {
    const logo = this.dataItem().currency?.logo;
    return logo ? `${logo.path}${logo.name}` : '';
  }

 get isBlocked(): boolean {
    return this.dataItem().state === 'BLOCKED';
  }
}
