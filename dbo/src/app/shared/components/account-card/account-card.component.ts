import { CommonModule, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface AccountCardData {
  balance: string;         // e.g. '198 888 378'
  decimals: string;        // e.g. '67'
  currency: string;        // e.g. 'UZS'
  statusLabel: string;     // e.g. 'Активный'
  isActive: boolean;
  accountType: string;     // e.g. 'Карточный счёт'
  maskedNumber: string;    // e.g. '20214 ** 001'
  flagSrc: string;         // URL or asset path to flag image
  statusIcon:string;
  onDetails?: () => void;
  expiryDate?:string;
  contractNumber?:string
  isBlocked?:boolean
  blockedDate?:string
  blockedReason?:string
  percent?: number
  isNotActiveAccount?:boolean
  blockedTextTranslateKey?:string
}

@Component({
  selector: 'app-account-card',
  imports: [CommonModule, TranslateModule, MatTooltipModule,NgClass],
  template: `
    <div
      class="relative flex flex-col justify-between overflow-hidden
             rounded-[20px] border-1 border border-[#EBEBEB]
             w-[360px] h-[178px] select-none"
    >
      <div class="absolute inset-0 bg-[#00A38D]"  [ngClass]="{ 'not_active--bg': card?.isNotActiveAccount }"></div>
      <div class="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-6 -right-4 w-32 h-32 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

      <div class="relative z-10 flex items-center gap-3 px-5 py-[10px]">
        <div class="w-[32px] h-[32px] overflow-hidden flex items-center justify-center"
             [ngClass]="roundedClass">
          <img [src]="card.flagSrc" alt="flag" class="w-full h-full object-contain"/>
        </div>

        <p class="text-white font-extrabold tracking-tight leading-none"   [ngClass]="{'not_active--text': card?.isNotActiveAccount }">
          <span class="text-xl font-bold">{{ card.balance }}</span>
          <span class="font-normal text-base">.{{ card.decimals }} {{ card.currency }}</span>
        </p>
        @if (showPercent) {
          <p class="text-white font-semibold text-sm ml-auto"  [ngClass]="{ 'not_active--text': card?.isNotActiveAccount }">{{ card.percent ?? 0 }}%</p>
        }
      </div>

      <div class="relative z-10 flex-1 rounded-[14px] bg-surface-2
                  flex flex-col gap-[6px] px-5 pt-3 pb-3 shadow-md">

        <div class="flex items-center gap-1.5">
          @if (card.isBlocked) {
            <div class="flex items-center gap-[6px]">
              <div class="bg-[#FB3748] flex items-center gap-[6px] rounded-[7px] py-[5px] px-[8px]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M6 1C4.34315 1 3 2.34315 3 4V5.01357C2.95663 5.01596 2.91466 5.01878 2.87409 5.0221C2.59304 5.04506 2.33469 5.09434 2.09202 5.21799C1.7157 5.40973 1.40973 5.7157 1.21799 6.09202C1.09434 6.33469 1.04506 6.59304 1.0221 6.87409C0.999989 7.14468 0.999994 7.47686 1 7.87934V8.12065C0.999994 8.52313 0.999989 8.85532 1.0221 9.12591C1.04506 9.40696 1.09434 9.66531 1.21799 9.90798C1.40973 10.2843 1.7157 10.5903 2.09202 10.782C2.33469 10.9057 2.59304 10.9549 2.87409 10.9779C3.14469 11 3.47687 11 3.87936 11H8.12064C8.52313 11 8.85531 11 9.12591 10.9779C9.40696 10.9549 9.66531 10.9057 9.90798 10.782C10.2843 10.5903 10.5903 10.2843 10.782 9.90798C10.9057 9.66531 10.9549 9.40696 10.9779 9.12591C11 8.85532 11 8.52314 11 8.12066V7.87934C11 7.47686 11 7.14468 10.9779 6.87409C10.9549 6.59304 10.9057 6.33469 10.782 6.09202C10.5903 5.7157 10.2843 5.40973 9.90798 5.21799C9.66531 5.09434 9.40696 5.04506 9.12591 5.0221C9.08534 5.01878 9.04338 5.01596 9 5.01357V4C9 2.34315 7.65685 1 6 1ZM8 5V4C8 2.89543 7.10457 2 6 2C4.89543 2 4 2.89543 4 4V5H8Z"
                        fill="white"/>
                </svg>
                @if(card?.blockedTextTranslateKey) {
                      <span class="text-white text-xs"> {{ (card?.blockedTextTranslateKey || 'global.account_blocked') | translate }}</span>
                }@else {
                      <span class="text-white text-xs">{{ 'global.account_blocked' | translate }}</span>
                  }
                <button
                  type="button"
                  class="cursor-pointer flex items-center justify-center"
                  [matTooltip]="blockedTooltip"
                  matTooltipPosition="right"
                  matTooltipClass="blocked-tooltip-right"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_19322_232702)">
                      <path
                        d="M12.5 8C12.5 5.51472 10.4853 3.5 8 3.5C5.51472 3.5 3.5 5.51472 3.5 8C3.5 10.4853 5.51472 12.5 8 12.5C10.4853 12.5 12.5 10.4853 12.5 8ZM7.5 10V8C7.5 7.72386 7.72386 7.5 8 7.5C8.27614 7.5 8.5 7.72386 8.5 8V10C8.5 10.2761 8.27614 10.5 8 10.5C7.72386 10.5 7.5 10.2761 7.5 10ZM8.00488 5.5C8.28103 5.5 8.50488 5.72386 8.50488 6C8.50488 6.27614 8.28103 6.5 8.00488 6.5H8C7.72386 6.5 7.5 6.27614 7.5 6C7.5 5.72386 7.72386 5.5 8 5.5H8.00488ZM13.5 8C13.5 11.0376 11.0376 13.5 8 13.5C4.96243 13.5 2.5 11.0376 2.5 8C2.5 4.96243 4.96243 2.5 8 2.5C11.0376 2.5 13.5 4.96243 13.5 8Z"
                        fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_19322_232702">
                        <rect width="12" height="12" fill="white" transform="translate(2 2)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
          } @else {
            <span class="flex items-center justify-center w-4 h-4 rounded-full shrink-0">
              <img [src]="card.statusIcon" alt="flag" class="w-3 h-3"/>
            </span>
            <span class="text-[12px] font-normal text-custom-primary leading-none">
              {{ card.statusLabel }}
            </span>
          }
        </div>

        <p class="text-xl font-semibold text-custom-primary truncate">
          {{ card.accountType }}
        </p>

        <div class="flex items-center justify-between mt-1">
          <div class="flex items-center">
            <span class="text-base text-custom-primary font-medium tracking-widest">
              {{ card.maskedNumber }}
            </span>
            @if (card.expiryDate) {
              <div class="flex items-center">
                <svg class="mx-1" width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.50036 5.00036C2.04202 5.00036 1.62346 4.88861 1.24467 4.66513C0.865885 4.43786 0.562855 4.13482 0.335582 3.75604C0.112098 3.37725 0.000355124 2.95869 0.000355124 2.50035C0.000355124 2.03823 0.112098 1.61967 0.335582 1.24467C0.562855 0.865885 0.865885 0.564749 1.24467 0.341264C1.62346 0.113991 2.04202 0.000354767 2.50036 0.000354767C2.96248 0.000354767 3.38104 0.113991 3.75604 0.341264C4.13482 0.564749 4.43596 0.865885 4.65945 1.24467C4.88672 1.61967 5.00036 2.03823 5.00036 2.50035C5.00036 2.95869 4.88672 3.37725 4.65945 3.75604C4.43596 4.13482 4.13482 4.43786 3.75604 4.66513C3.38104 4.88861 2.96248 5.00036 2.50036 5.00036Z"
                    fill="#A4A4A4"/>
                </svg>
                <span class="text-base text-custom-primary font-medium tracking-widest">
                  {{ card.expiryDate }}
                </span>
              </div>
            }
            @if (card.contractNumber) {
              <div class="flex items-center">
                <svg class="mx-1" width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.50036 5.00036C2.04202 5.00036 1.62346 4.88861 1.24467 4.66513C0.865885 4.43786 0.562855 4.13482 0.335582 3.75604C0.112098 3.37725 0.000355124 2.95869 0.000355124 2.50035C0.000355124 2.03823 0.112098 1.61967 0.335582 1.24467C0.562855 0.865885 0.865885 0.564749 1.24467 0.341264C1.62346 0.113991 2.04202 0.000354767 2.50036 0.000354767C2.96248 0.000354767 3.38104 0.113991 3.75604 0.341264C4.13482 0.564749 4.43596 0.865885 4.65945 1.24467C4.88672 1.61967 5.00036 2.03823 5.00036 2.50035C5.00036 2.95869 4.88672 3.37725 4.65945 3.75604C4.43596 4.13482 4.13482 4.43786 3.75604 4.66513C3.38104 4.88861 2.96248 5.00036 2.50036 5.00036Z"
                    fill="#A4A4A4"/>
                </svg>
                <span class="text-base text-custom-primary font-medium tracking-widest">
                  {{ card.contractNumber }}
                </span>
              </div>
            }
          </div>
          <button
            (click)="onDetails.emit()"
            class="cursor-pointer rounded-10px bg-surface-1 font-semibold text-xs py-[9px] px-[14px] text-custom-primary"
          >
            {{ "new_loan.details" | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      .tooltip {
        bottom: 100%;
        margin-bottom: 12px;
      }

      .tooltip::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 10px;
        height: 10px;
        background: #1C1C1E;
      }


    }

      .not_active--bg{
        background-color:#EBEBEB !important;

      }
        .not_active--text {
          color:#A3A3A3 !important;
        }

  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountCardComponent {
  @Input() card: AccountCardData = {
    balance: '',
    decimals: '',
    currency: '',
    statusIcon:'',
    statusLabel: '',
    isActive: true,
    accountType: '',
    maskedNumber: '',
    flagSrc: '',
    isBlocked:false,
    blockedTextTranslateKey:'',
    isNotActiveAccount:false,
    blockedDate:'',
    blockedReason:'',
    onDetails: () => this.onDetails.emit()
  };

  private translate = inject(TranslateService);

  onDetails = output<void>();

  @Input() showPercent: boolean = false;
  @Input() radius: number = 50;

  get roundedClass(): string {
    return `rounded-[${this.radius}px]`;
  }

  get blockedTooltip(): string {
    console.log('bingo',this.card)

  if (!this.card.blockedReason ) return '';

  const dateLabel = this.card.blockedDate
    ? this.translate.instant('myAccounts.block_date', { date: this.card.blockedDate })
    : '';
  return [this.card.blockedReason , dateLabel].filter(Boolean).join('\n');
}

}
