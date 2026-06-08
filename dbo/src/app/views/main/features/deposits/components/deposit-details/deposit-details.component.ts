import {ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, signal} from "@angular/core";
import {AccountService} from "../../../../../../core/services/account.service";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {take, tap} from 'rxjs';
import {CommonModule} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AccountsDto, DailyTransaction} from "../../../accounts-payments/models/accounts-payments.model";
import {PaymentTabKey} from "../../../new-main/constants/new-main.const";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {SvgIconComponent} from "src/app/shared/components/svg-icon/svg-icon.component";
import {DepositPaymentsComponent} from "./deposit-payments/deposit-payments.component";
import {DepositService} from "../../services/deposit.service";
import {DepositItemDTO} from "../../models/deposits.model";
import {DepositDetailsModalComponent} from "../modals/deposit-details-modal/deposit-details-modal.component";
import { AccountCardComponent, AccountCardData } from "src/app/shared/components/account-card/account-card.component";
import { ToastrService } from "ngx-toastr";
// import {RequisiteComponent} from "../../../corp-cards/components/requisite/requisite.component";
// import { FilterPaymentComponent } from "src/app/shared/components/filter-payment/filter-payment.component";
// import { AccountPaymentsComponent } from "../../../new-accounts/components/account-payments/account-payments.component";

@Component({
  selector: 'app-deposit-details',
  imports: [CommonModule, SvgIconComponent, RouterLink, TranslateModule, MatTooltip, DepositPaymentsComponent, AccountCardComponent],
  template: `
    <ng-container class="m-0">
      <div>
        <div>
          <!-- Back button -->
          <div routerLink="/deposits/my-deposits" class="flex items-center py-3 mt-6 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" class="text-custom-primary"/>
            </svg>
            <span class="text-md font-medium pl-2 text-custom-primary">{{ 'global.back' | translate }}</span>
          </div>


          <div class="mt-[30px] flex">
            @if (depositContract()) {
              <app-account-card [card]="depositCard()" [showPercent]="true"
                                (onDetails)="openDetails($event)"></app-account-card>
            }
            <!--  <div
              class="bg-gradient-to-r from-black to-primary-base rounded-[20px] p-5 text-white min-w-[289px] inline-block">


              <div class="flex items-center mb-2">
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 border border-white">
                  <img src="assets/flags/radius-20/UZS.png" alt="">
                </div>
              </div>
              <div class="text-base font-normal opacity-50">
                {{ depositContract()?.name }}
              </div>
              <div class="text-xl font-semibold mb-1">
                {{ integerPart(depositContract()?.depSaldo?.amount) }}<span>.{{ decimalPart(depositContract()?.depSaldo?.amount) }} {{ depositContract()?.depSaldo?.currency }}</span>
              </div>
              <div class="text-base font-normal opacity-50">
                {{ depositContract()?.account?.slice(0, 5) }} •••• {{ depositContract()?.account?.slice(-3) }}
              </div>
            </div>  -->

            <!-- Action buttons -->
            <div class="px-4 flex items-center">
              <div class="flex items-center gap-10  ml-10">
                <!-- Пополнить-->
<!--                <div class="text-center cursor-pointer"-->
<!--                     (click)="userService.hasAction('ACCOUNTS') ? createPayment() : {}"-->
<!--                     [matTooltip]="userService.hasAction('ACCOUNTS') ? '' : 'У вас нет прав'"-->
<!--                     [style.user-select]="userService.hasAction('ACCOUNTS') ? '' : 'none'"-->
<!--                     [style.opacity]="userService.hasAction('ACCOUNTS') ? '1' : '0.3'"-->
<!--                     [style.cursor]="userService.hasAction('ACCOUNTS') ? 'pointer' : 'not-allowed'"-->
<!--                >-->
<!--                  <div-->
<!--                    class="w-14 h-14 bg-surface-2  text-primary-base hover:bg-primary-base hover:text-white border border-custom-border rounded-full flex items-center justify-center mb-2 mx-auto">-->

<!--                    <app-svg-icon name="hamkor_upload_2" [size]="20"></app-svg-icon>-->

<!--                  </div>-->
<!--                  <span class="text-sm font-semibold text-custom-primary">{{ 'deposits.replenish' | translate }}</span>-->
<!--                </div>-->

                <!-- Снять частично-->
<!--                <div class="text-center cursor-pointer"-->
<!--                     (click)="userService.hasAction('ACCOUNTS') ? createPayment() : {}"-->
<!--                     [matTooltip]="userService.hasAction('ACCOUNTS') ? '' : 'У вас нет прав'"-->
<!--                     [style.user-select]="userService.hasAction('ACCOUNTS') ? '' : 'none'"-->
<!--                     [style.opacity]="userService.hasAction('ACCOUNTS') ? '1' : '0.3'"-->
<!--                     [style.cursor]="userService.hasAction('ACCOUNTS') ? 'pointer' : 'not-allowed'"-->
<!--                >-->
<!--                  <div-->
<!--                    class="w-14 h-14 bg-surface-2  text-primary-base hover:bg-primary-base hover:text-white border border-custom-border rounded-full flex items-center justify-center mb-2 mx-auto">-->

<!--                    <app-svg-icon name="hamkor_upload_2" [size]="20" class="rotate-180"></app-svg-icon>-->

<!--                  </div>-->
<!--                  <span-->
<!--                    class="text-sm font-semibold text-custom-primary">{{ 'deposits.partial_withdrawal_action' | translate }}</span>-->
<!--                </div>-->

                <!-- Закрыть досрочно -->
<!--                <div class="text-center cursor-pointer"-->
<!--                     (click)="userService.hasAction('ACCOUNTS') ? createPayment() : {}"-->
<!--                     [matTooltip]="userService.hasAction('ACCOUNTS') ? '' : 'У вас нет прав'"-->
<!--                     [style.user-select]="userService.hasAction('ACCOUNTS') ? '' : 'none'"-->
<!--                     [style.opacity]="userService.hasAction('ACCOUNTS') ? '1' : '0.3'"-->
<!--                     [style.cursor]="userService.hasAction('ACCOUNTS') ? 'pointer' : 'not-allowed'"-->
<!--                >-->
<!--                  <div-->
<!--                    class="w-14 h-14 bg-surface-2  text-primary-base hover:bg-primary-base hover:text-white border border-custom-border rounded-full flex items-center justify-center mb-2 mx-auto">-->

<!--                    <app-svg-icon name="hamkor_deposit_outline" [size]="20"></app-svg-icon>-->

<!--                  </div>-->
<!--                  <span-->
<!--                    class="text-sm font-semibold text-custom-primary">{{ 'deposits.early_close' | translate }}</span>-->
<!--                </div>-->

                <!-- Детали -->
                <!--    <div class="text-center cursor-pointer"
                      (click)="userService.hasAction('ACCOUNTS') ? openDetails($event) : {}"
                      [matTooltip]="userService.hasAction('ACCOUNTS') ? '' : 'У вас нет прав'"
                      [style.user-select]="userService.hasAction('ACCOUNTS') ? '' : 'none'"
                      [style.opacity]="userService.hasAction('ACCOUNTS') ? '1' : '0.3'"
                      [style.cursor]="userService.hasAction('ACCOUNTS') ? 'pointer' : 'not-allowed'"
                 >
                   <div
                     class="w-14 h-14 bg-surface-2  text-primary-base hover:bg-primary-base hover:text-white border border-custom-border rounded-full flex items-center justify-center mb-2 mx-auto">

                     <app-svg-icon name="hamkor_paper" [size]="20"></app-svg-icon>

                   </div>
                   <span class="text-sm font-semibold text-custom-primary">{{ 'deposits.details' | translate }}</span>
                 </div>
                   -->

              </div>
            </div>
          </div>

          <div class="my-10 flex items-center justify-between">
            <div class="flex items-center gap-10">
              <!--              <div class="flex items-center">-->
              <!--                <img [src]="(depositContract()?.stateLogo?.path ?? '') + (depositContract()?.stateLogo?.name ?? '')"-->
              <!--                     alt="status" width="20">-->
              <!--                <span class="text-xs font-medium ml-2 text-custom-primary">{{ depositContract()?.stateName }}</span>-->
              <!--              </div>-->

              <div class="bg-surface-2 border border-custom-border rounded-full flex items-center gap-2 py-4 px-5">
                <div>
                  <div class="flex items-center gap-1">
                    <span class="text-sm text-custom-secondary font-medium">{{ 'deposits.term' | translate }}</span>
                    <span class="text-sm text-custom-primary font-semibold">до {{ depositContract()?.endDate }}</span>
                  </div>
                </div>
                <!--                <div>-->
                <!--                  <svg width="2" height="20" viewBox="0 0 2 20" fill="none" xmlns="http://www.w3.org/2000/svg">-->
                <!--                    <path d="M1.13641 0.000354767V19.1367H4.43459e-05V0.000354767H1.13641Z" fill="#A4A4A4"/>-->
                <!--                  </svg>-->
                <!--                </div>-->
                <!--                <div>-->
                <!--                  <div class="flex items-center gap-1">-->
                <!--                    <span class="text-sm text-custom-secondary font-medium">{{ 'deposits.interest_rate' | translate }}</span>-->
                <!--                    <span class="text-sm text-custom-primary font-semibold">{{ depositContract()?.percent ?? 0 }}%</span>-->
                <!--                  </div>-->
                <!--                </div>-->
              </div>
            </div>

<!--            <div class="bg-surface-2 border border-custom-border rounded-full flex items-center gap-2 py-4 px-5 ">-->
<!--              <div class="flex items-center gap-5">-->
<!--                <span-->
<!--                  class="text-sm text-custom-secondary font-medium">{{ 'deposits.interest_accrual_schedule' | translate }}</span>-->
<!--                <app-svg-icon name="hamkor_calendar_full" class="text-primary-base "></app-svg-icon>-->
<!--              </div>-->
<!--            </div>-->

          </div>
        </div>

        <div>
          <app-deposit-payments [accountNumber]="accountNumber"></app-deposit-payments>
        </div>
      </div>
    </ng-container>
  `,
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositDetailsComponent implements OnInit {
// DEPOSIT_TABS= DEPOSIT_TABS
  private depositService = inject(DepositService);

  constructor(
    private destroyRef: DestroyRef,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private _cdRef: ChangeDetectorRef,
    private toastrService:ToastrService,
    private translateService:TranslateService
  ) {
  }

  protected readonly Math = Math;
  protected readonly Number = Number;
  readonly matDialog = inject(MatDialog);
  public userService = inject(UserService);

  accountInfo!: any;
  qrUrl!: string;
  accountNumber = '';
  accountId = '';

  /** Active tab for Все / Активные */
  activeTab: 'all' | 'active' = 'all';

  public readonly activeTabs = signal<PaymentTabKey>('all');
  accountForCreatingPayment = signal<AccountsDto | null>(null);
  dailyTransaction = signal<DailyTransaction | null>(null);
  depositContract = signal<DepositItemDTO | null>(null);

  depositCard = computed<AccountCardData>(() => {
    const d = this.depositContract();

      if (!d) {
    return {
      balance: '0',
      decimals: '00',
      currency: 'UZS',
      statusLabel: '',
      statusIcon:'',
      isActive: false,
      accountType: '',
      maskedNumber: '',
      flagSrc: 'assets/flags/radius-20/UZS.png',
    };
  }



    return {
      balance: this.integerPart(d?.depSaldo?.amount),
      decimals: this.decimalPart(d?.depSaldo?.amount),
      currency: d?.depSaldo?.currency ?? '',
      accountType: d?.name ?? '',
      maskedNumber: d?.account
        ? `${d.account.slice(0, 5)} ** ${d.account.slice(-3)}`
        : '',
      // flagSrc:`assets/flags/radius-20/${d?.currency.currency}.png`,
      flagSrc:`${d?.currency.logo.path}${d?.currency.logo.name}`,
      statusLabel: d?.stateName ?? '',
      statusIcon: (d?.stateLogo?.path ?? '') + (d?.stateLogo?.name ?? ''),
      percent: d?.percent ?? 0,
      isActive: true,
    };
  });


  ngOnInit() {
    this.initLoanId();
    this.getAccountDataFromQuearyParams();
    this.getDailyTransaction();
    this.getDepositContract();
  }

  private getDepositContract() {
    const id = this.route.snapshot.params['id'];
    if (!id) return;
    this.depositService.getDepositContractById(id).pipe(
      take(1)
    ).subscribe(res => {
      this.depositContract.set(res);
    });
  }

  deniedAccounts = [
    "Проценты по срочным депозитам", "Проценты по сберегательным депозитам",
    "Срочный депозит", "Начисленные проценты по кредиту", "Грантовый счет",
    "Внебалансовый счет по аккредитивам", "транзитный счет для приёма оплат",
    "Счета резерва возможных убытков",
  ];

  openDetails(event: any): void {
    if(this.userService.hasAction('ACCOUNTS')) {
    this.matDialog.open(DepositDetailsModalComponent, {
      data: this.depositContract(),
      width: '475px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
    }else {
      this.toastrService.warning(this.translateService.instant('new_second.you_have_no_rights'))
    }

  }

  createPayment() {
    if (this.deniedAccounts.includes(this.accountForCreatingPayment()?.accountType as string)) return;
    if (this.accountForCreatingPayment()?.accountType)
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {'account': encodeURIComponent(JSON.stringify(this.accountForCreatingPayment()))}
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

  private getDailyTransaction() {
    this.accountService.getDailyTransaction(this.accountNumber).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => this.dailyTransaction.set(res ?? null))
    ).subscribe();
  }

  private getAccountDataFromQuearyParams() {
    this.route.queryParams.pipe(
      tap(params => {
        if (params['data']) {
          try {
            this.accountForCreatingPayment.set(JSON.parse(decodeURIComponent(params['data'])));
          } catch (e) {
            console.error('failed to parse account from query param', e);
          }
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  initLoanId() {
    this.accountNumber = this.route.snapshot.params['id'];
    this.accountId = this.route.snapshot.queryParams['id'];
    if (!this.accountNumber) return;
    this.accountService.getAccountInfo(this.accountNumber).pipe(take(1)).subscribe(val => {
      this.accountInfo = val;
      this.loadQrCode();
    });
  }

  loadQrCode() {
    if (!this.accountInfo.id) return;
    this.accountService.getAccountQr({accountId: this.accountInfo.id.toString()}).pipe(take(1)).subscribe(val => {
      this.qrUrl = val?.msg || '';
    });
  }

  // openDialogDetail() {
  //   const dialogData = {...this.accountInfo, qr: this.qrUrl};
  //   this.matDialog.open(RequisiteComponent, {
  //     data: dialogData,
  //     width: '475px',
  //     height: 'calc(100% - 16px)',
  //     position: {right: '0'},
  //     panelClass: 'right-side-dialog',
  //   });
  // }
  //
  // navigateToStatements() {
  //   this.router.navigate(['/charts/create-statement'], {
  //     queryParams: {'type': 'account_activities', 'account': this.accountNumber}
  //   });
  // }
}
