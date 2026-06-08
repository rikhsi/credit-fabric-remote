import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {NgxMaskPipe} from "ngx-mask";
import {AccountService} from "../../../../../../core/services/account.service";
import {TemplateService} from "../../../../../../core/services/template.service";
import {TransactionOneDetailDto} from "../../../../../../core/models/transaction.models";
import {AccountInfoDto} from "../../../accounts-payments/models/accounts-payments.model";
import {TransactionDetailComponent} from "../../../transaction-detail/transaction-detail.component";
import {PAYMENT_ACTIONS } from '../../../add-payment/utils/payment.utils';
import {NgIf} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {MatTooltip} from "@angular/material/tooltip";
import {UserService} from "../../../../../../core/services/user.service";
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: './create-modal.component.html',
  imports: [
    NgIf,
    TranslateModule,
    MatTooltip
  ]
})
export class CreateModalComponent implements OnInit {
  private readonly accountService = inject(AccountService)
  private readonly userService = inject(UserService)
  public data: { module: string, types: [string] }[] = inject(MAT_DIALOG_DATA)
  private _templateService = inject(TemplateService);
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
  }

  navigateTo(item) {
    this.analyticsService.logFirebaseCustomEvent('create_template_screen_jump', null);

    if (!this.requestPermissions(item.link)) {
      this.router.navigate(['/templates'])
    } else {
      this.router.navigate(['/payment/' + item.link], { queryParams: { type: 'create' }  });
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
    const moduleAccount = this.data.find(item => item.module === 'ACCOUNTS');
    const moduleCard = this.data.find(item => item.module === 'CARDS');
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
    }
    return false;
  }

  protected readonly Math = Math;
  protected readonly PAYMENT_ACTIONS = PAYMENT_ACTIONS.filter(item => item.link !== 'transfer-to-munis');
}
