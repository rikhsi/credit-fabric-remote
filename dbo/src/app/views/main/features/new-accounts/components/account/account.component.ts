import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { AccountService } from "../../../../../../core/services/account.service";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { take, tap } from 'rxjs';
import { CommonModule } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import { AccountPaymentsComponent } from "../account-payments/account-payments.component";
import { RequisiteComponent } from "../../../corp-cards/components/requisite/requisite.component";
import { MatDialog } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AccountsDto, DailyTransaction } from "../../../accounts-payments/models/accounts-payments.model";
import { FilterPaymentComponent } from "src/app/shared/components/filter-payment/filter-payment.component";
import { PaymentTabKey } from "../../../new-main/constants/new-main.const";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import { AccountCardComponent, AccountCardData } from "src/app/shared/components/account-card/account-card.component";
import { maskAccountNumber } from "src/app/core/utils/mask.utils";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {ToastrService} from "ngx-toastr";
import {KartotekaModalComponent} from "../../../add-payment/modals/kartoteka-modal/kartoteka-modal.component";

@Component({
  selector: 'app-account',
  imports: [CommonModule, AccountPaymentsComponent, RouterLink, NgxMaskPipe, FilterPaymentComponent, TranslateModule, MatTooltip,AccountCardComponent],
  templateUrl: './account.component.html',
  styles: ``,
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
    private translateService = inject(TranslateService)

  constructor(
    private destroyRef: DestroyRef,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private router: Router,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  protected readonly Math = Math;
  readonly matDialog = inject(MatDialog)
  public userService = inject(UserService)
  public utilsService = inject(UtilsService)
  public toast = inject(ToastrService)
  public transactionService = inject(TransactionService)
  accountInfo = signal<any>(null);
  qrUrl!: string;
  accountNumber = '';
  accountId = '';
  public readonly activeTabs = signal<PaymentTabKey>('all');
  accountForCreatingPayment = signal<AccountsDto | null>(null)
  dailyTransaction = signal<DailyTransaction | null>(null)

accountCard = computed<AccountCardData>(() => {

  const info = this.accountInfo();
  const account = this.accountForCreatingPayment();
 if (!info || !account) {
    return {
      balance: '0',
      decimals: '00',
      currency: 'UZS',
      statusLabel: '',
      isActive: false,
      accountType: '',
      maskedNumber: '',
      statusIcon:'',
      flagSrc: 'https://flagcdn.com/w80/uz.png',
    };
  }

  const rawAmount = Number(account?.balance?.amount ?? 0) / 100;

  const [intPart, decPart = '00'] = rawAmount.toFixed(2).split('.');

  const formattedInt = Number(intPart).toLocaleString('ru-RU').replace(/,/g, ' ');
  return {
    balance: formattedInt,
    decimals: decPart,
    currency: account?.balance?.currency ?? 'UZS',
    statusLabel: info?.active ? this.translateService.instant('myAccounts.active') : this.translateService.instant('myAccounts.blocked'),
    isActive: !!info?.active,
    accountType: info?.accountType ?? 'Карточный счёт',
    maskedNumber:maskAccountNumber(info?.accountNumberCard)  ?? '',
    flagSrc: `${info.balance?.logo?.path}${info.balance?.logo?.name}`,
    isBlocked:info?.active == false,
    isNotActiveAccount:info?.active == false,
    statusIcon:info?.active ? 'assets/new-icons/active.svg' : 'assets/new-icons/blocked-icon.svg',
    onDetails: () => {
    },
    blockedDate:info.accBlockDate,
    blockedReason: this.getBlockedReason({accBlockReason:info.accBlockReason, accBlockDetails:info.accBlockDetails})
    };
});

  ngOnInit() {
    this.initLoanId()

    this.getAccountDataFromQuearyParams()
    // setTimeout(() => {
    //   console.log(this.accountForCreatingPayment(), "ff")
    // }, 3000)

    this.getDailyTransaction()

  }

  deniedAccounts = ["Проценты по срочным депозитам", "Проценты по сберегательным депозитам", "Срочный депозит", "Начисленные проценты по кредиту", "Грантовый счет", "Внебалансовый счет по аккредитивам", "транзитный счет для приёма оплат", "Счета резерва возможных убытков", "Внебалансовый счет по Картотека-1", "Внебалансовый счет по Картотека-2", "Внебалансовый счет по Купленные дебиторские задолженности", "Внебалансовый учет гарантий и поручительств", "Внебалансовый счет для начисления %% и пени", "Внебалансовый счет по отсроченным %%", "Внебалансовый счет Обязательство Банка перед Клиентом", "Внебалансовый счет Обязательство Клиента перед Банком", "Продажа на условиях СВОП", "Покупка на условиях СВОП", "Внебалансовый счет Обеспечение Залога", "Внебалансовый счет Обеспечение Гарантии или Поручительства", "Списанные кредиты и лизинг", "Внебалансовый контр-счет"];


  private getBlockedReason(info: {
    accBlockReason?: string | null;
    accBlockDetails?: string | null;
  }): string {
    if (info.accBlockReason?.trim()) {
      return info.accBlockReason;
    }
    if (info.accBlockDetails?.trim()) {
      return info.accBlockDetails;
    }
    return '';
  }

  openKartotekaModal(data: any) {
    this.matDialog.open(KartotekaModalComponent, {
      data: data,
      width: "467px",
      minHeight: "620px"
    });
  }

  createPayment() {
    if (this.deniedAccounts.includes(this.accountForCreatingPayment()?.accountType as string)) {
      return
    }

    if (this.accountForCreatingPayment()?.status === 'BLOCKED') {
      this.utilsService.spinnerState$$.next(true);
      this.transactionService.checkKartoteka('TRANSACTION').pipe().subscribe({
        next: (res) => {
          this.utilsService.spinnerState$$.next(false);
          if (res.hasKartoteka2 && res.data.length === 0) {
            this.openKartotekaModal(res.kartoteka2Details)
          } else {
            this.router.navigate(['/payment/transfer-to-account'], {
              queryParams: {
                isKartoteka: 'kartoteka'
              }
            })
          }
        },
        error: err => {
          this.utilsService.spinnerState$$.next(false);
          this.toast.error(err.message);
        },
      })
    } else if (this.accountForCreatingPayment()?.accountType) {
      this.router.navigate(['/payment/transfer-to-account'], {
        queryParams: {
          'account': encodeURIComponent(JSON.stringify(this.accountForCreatingPayment()))
        }
      })
    }
  }


  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  private getDailyTransaction() {
    this.accountService.getDailyTransaction(this.accountNumber).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(res => {
        if (res) {
          this.dailyTransaction.set(res)
        } else {
          this.dailyTransaction.set(null)
        }
        // console.log('Daily Transaction Data:', res);
      })
    ).subscribe()
  }


  private getAccountDataFromQuearyParams() {
    this.route.queryParams.pipe(
      tap(params => {
        if (params['data']) {
          try {
            let account = JSON.parse(decodeURIComponent(params['data']));
            this.accountForCreatingPayment.set(account)
          } catch (e) {
            console.error('failed to parse account from query param', e);
          }
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }

  initLoanId() {
    this.accountNumber = this.route.snapshot.params['id'];
    this.accountId = this.route.snapshot.queryParams['id'];
    if (!this.accountNumber) return
    this.accountService.getAccountInfo(this.accountNumber).pipe(take(1)).subscribe(val => {
      this.accountInfo.set(val);
      this.loadQrCode()
    })
  }

  loadQrCode() {
    if (!this.accountInfo()?.id) return
    this.accountService.getAccountQr({ accountId: this.accountInfo()?.id.toString() }).pipe(take(1)).subscribe(val => {
      this.qrUrl = val?.msg || '';
    })
  }

  openDialogDetail() {
    const dialogData = { ...this.accountInfo(), qr: this.qrUrl };
    this.matDialog.open(RequisiteComponent, {
      data: dialogData,
      width: '475px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }

  navigateToStatements() {
    // this.router.navigate(['/charts/create-statement'], {
    //   queryParams: {
    //     'type': 'account_activities',
    //     'account': this.accountNumber
    //   }
    // })
    this.router.navigate(['reports/create'], {
      queryParams: {
        'template_id': 'account-activity',
        'account': this.accountNumber
      }
    })
  }


  protected readonly Number = Number;
}
