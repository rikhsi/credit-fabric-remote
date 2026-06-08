import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { DepositItemDTO } from '../../../models/deposits.model';
import {MatDivider} from "@angular/material/divider";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-deposit-details-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule, MatIconModule, SvgIconComponent, MatDivider],
  template: `
    <div class="bg-surface-2 rounded-[22px] border border-custom-soft-200 h-full flex flex-col">

      <!-- Header -->
      <div class="flex justify-between items-center px-[30px] py-4">
        <span
          class="text-[18px] font-semibold leading-5 text-custom-primary">{{ 'deposits.deposit_details' | translate }}</span>
        <div (click)="close()" class="w-7 h-7 bg-surface-1 rounded-md flex justify-center items-center cursor-pointer">
          <mat-icon class="!text-[14px] !h-[14px] !w-[14px] text-custom-text-close">close</mat-icon>
        </div>
      </div>

      <mat-divider/>

      <!-- Status + Balance -->
      <div class="flex flex-col px-[30px] py-4 gap-2">
        <div class="flex items-center gap-2">
          <img [src]="(data?.stateLogo?.path ?? '') + (data?.stateLogo?.name ?? '')" alt="status" width="20">
          <span class="text-xs font-medium ml-2 text-custom-primary">{{ data?.stateName }}</span>
<!--          @if (data?.state === 'ACTIVE') {-->
<!--            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">-->
<!--              <path fill-rule="evenodd" clip-rule="evenodd"-->
<!--                    d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM8.84024 4.74933C9.05325 4.53632 9.05325 4.19096 8.84024 3.97794C8.62723 3.76493 8.28186 3.76493 8.06885 3.97794L5.18182 6.86497L3.93115 5.61431C3.71814 5.40129 3.37277 5.40129 3.15976 5.61431C2.94675 5.82732 2.94675 6.17268 3.15976 6.38569L4.79612 8.02206C5.00914 8.23507 5.3545 8.23507 5.56751 8.02206L8.84024 4.74933Z"-->
<!--                    fill="#1FC16B"/>-->
<!--            </svg>-->
<!--            <span class="text-xs font-medium text-custom-secondary">{{ data?.stateName }}</span>-->
<!--          } @else {-->
<!--            <span class="text-xs font-medium text-red-500">{{ 'deposits.blocked' | translate }}</span>-->
<!--          }-->
        </div>

        <div>
          <span class="text-4xl font-bold text-custom-primary tracking-tight">{{ integerPart(data?.depSaldo?.amount) }}</span>
          <span class="text-2xl font-bold text-custom-secondary">.{{ decimalPart(data?.depSaldo?.amount) }}</span>
          <span class="text-2xl font-bold text-custom-primary ml-2">{{ data?.depSaldo?.currency }}</span>
        </div>

        <p class="text-sm text-custom-muted">{{ data?.account }}&nbsp;&nbsp;{{ data?.contractDate }}</p>
      </div>

      <mat-divider/>

      <!-- Detail rows -->
      <div class="flex-1 overflow-y-auto px-[30px] py-2">

        @if (data?.name) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.deposit_name' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.name }}</p>
          </div>
        }

        @if (data?.account) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.account_number' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.account }}</p>
          </div>
        }

        @if (data?.contractNumber) {
          <div class="py-[10px] flex items-center justify-between">
            <div>
              <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.contract_number' | translate }}</p>
              <p class="text-sm text-custom-primary font-medium">{{ data?.contractNumber }}</p>
            </div>
            <app-svg-icon (click)="copyContractNumber()" name="hamkor_copy" [size]="22"
                          class="text-custom-text-tertiary cursor-pointer"></app-svg-icon>
          </div>
        }

        @if (data?.depSaldo?.currency) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.currency' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.depSaldo?.currency }}</p>
          </div>
        }

        @if (data?.percent) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.interest_rate' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.percent }}%</p>
          </div>
        }

        @if (data?.contractDate) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.opening_date' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.contractDate }}</p>
          </div>
        }

        @if (data?.endDate) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.closing_date' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.endDate }}</p>
          </div>
        }

        @if (data?.month) {
          <div class="py-[10px]">
            <p class="text-xs text-custom-muted mb-0.5">{{ 'deposits.term' | translate }}</p>
            <p class="text-sm text-custom-primary font-medium">{{ data?.month }} {{ monthSuffix(data?.month) }}</p>
          </div>
        }

      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositDetailsModalComponent {
  public readonly data: DepositItemDTO = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DepositDetailsModalComponent>);
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  close(): void {
    this.dialogRef.close();
  }

  copyContractNumber(): void {
    if (this.data?.contractNumber) {
      navigator.clipboard.writeText(this.data.contractNumber).then(() => {
        this.toastr.info(this.translate.instant('deposits.copied'), '', { positionClass: 'toast-top-center' });
      });
    }
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

  monthSuffix(n: any): string {
    const num = Number(n);
    if (!num) return '';
    const lang = this.translate.currentLang || this.translate.defaultLang || 'ru';

    if (lang === 'ru') {
      const mod10 = num % 10;
      const mod100 = num % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'месяцев';
      if (mod10 === 1) return 'месяц';
      if (mod10 >= 2 && mod10 <= 4) return 'месяца';
      return 'месяцев';
    }
    if (lang === 'uz-Latn') return 'oy';
    if (lang === 'uz-Cyrl') return 'ой';
    if (lang === 'zh') return '个月';
    // en
    return num === 1 ? 'month' : 'months';
  }
}
