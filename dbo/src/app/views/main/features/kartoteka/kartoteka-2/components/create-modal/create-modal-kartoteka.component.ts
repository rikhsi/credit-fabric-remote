import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {NgxMaskPipe} from "ngx-mask";
import {NgIf} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {MatTooltip} from "@angular/material/tooltip";
import {AccountService} from "../../../../../../../core/services/account.service";
import {UserService} from "../../../../../../../core/services/user.service";
import {AccountInfoDto} from "../../../../accounts-payments/models/accounts-payments.model";
import {FirebaseAnalyticsService} from "../../../../../../../../../firebase-analytics.service";
import {TransactionDetailComponent} from "../../../../transaction-detail/transaction-detail.component";
import {KARTOTEKA_ACTIONS, KARTOTEKA_RESERVE_ACTIONS} from "../../../../add-payment/utils/payment.utils";

@Component({
  selector: 'app-create-modal-kartoteka',
  templateUrl: './create-modal-kartoteka.component.html',
  imports: [
    NgIf,
    TranslateModule,
    MatTooltip
  ]
})
export class CreateModalKartotekaComponent implements OnInit {
  private readonly accountService = inject(AccountService)
  private readonly userService = inject(UserService)
  public data: {permissions : { module: string, types: [string] }[], type: string} = inject(MAT_DIALOG_DATA)
  public readonly account = signal<AccountInfoDto | null>(null)
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  public actionButtons = signal<{ title: string, icon: string, action: string }[]>([
    {
      action: 'sign',
      icon: './assets/new-icons/sign-02.svg',
      title: 'Подписать'
    },
    {
      action: 'autopay',
      icon: './assets/new-icons/calendar-check-02.svg',
      title: 'Запланировать'
    },
    {
      action: 'reverse',
      icon: './assets/new-icons/reverse-right.svg',
      title: 'Повторить'
    },
    {
      action: 'edit',
      icon: './assets/new-icons/edit.svg',
      title: 'Редактировать'
    },
    {
      action: 'delete',
      icon: './assets/new-icons/trash.svg',
      title: 'Удалить'
    },


  ])
  user!: any;
  director!: any;
  headOfFinance!: any;

  historyOpened = true;

  ngOnInit() {
    console.log(this.data.permissions, "pe")
  }

  navigateTo(item) {
    this.analyticsService.logFirebaseCustomEvent('create_template_screen_jump', null);
    console.log(item, "tem")
    if (!this.requestPermissions(item.link)) {
      return
    } else if (item.text === 'Зарплатная ведомость') {
      this.router.navigate([item.link], { queryParams: { isKartoteka: 'kartoteka' }  });
      this._matDialogRef.close()
    } else {
      this.router.navigate(['/payment/' + item.link], { queryParams: { isKartoteka: 'kartoteka', kartotekaType: this.data?.type }  });
      this._matDialogRef.close()
    }
  }

  loading = false;

  formatDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const monthName = months[parseInt(month, 10) - 1];

    return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }

  constructor(
    private _matDialog: MatDialog,
    protected _matDialogRef: MatDialogRef<TransactionDetailComponent>,
    private destroyRef: DestroyRef,
    protected router: Router,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }


  requestPermissions(moduleName: string): boolean {
    const moduleAccount = this.data.permissions.find(item => item.module === 'ACCOUNTS');
    const moduleCard = this.data.permissions.find(item => item.module === 'CARDS');
    const moduleSalary = this.data.permissions.find(item => item.module === 'SALARY');
    if (moduleName === 'transfer-to-account' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-card' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-corporate-card' && moduleCard) {
      return moduleCard.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-budget' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'transfer-to-treasure' && moduleAccount) {
      return moduleAccount.types.includes('ACTION')
    } else if (moduleName === 'payroll-project/statements' && moduleSalary) {
      return moduleSalary.types.includes('ACTION')
    }
    return false;
  }

  protected readonly Math = Math;
  protected readonly PAYMENT_ACTIONS = this.data?.type === 'bron' ? KARTOTEKA_ACTIONS : KARTOTEKA_RESERVE_ACTIONS;
}
