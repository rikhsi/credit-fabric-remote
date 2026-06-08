import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, filter, startWith } from 'rxjs';
import { MinorToMajorPipe } from "../../../../../../shared/lib/minor-to-major.pipe";
import { IconComponent, IconName } from "../../../../../../shared/ui/icon/icon.component";
import { PageLayoutComponent } from "../../../../../../shared/components/page-layout/page-layout.component";
import { TableFiltersComponent } from "../../../../../../shared/components/table-filters/table-filters.component";
import { FilterConfig } from "../../../../../../shared/components/table-filters/table-filters.model";
import { MatDialog } from "@angular/material/dialog";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SalaryProjectService } from "../../../../../../core/services/salary-project.service";
import {
  PayrollStatementDetailDialogComponent
} from "../payroll-statement-detail-dialog/payroll-statement-detail-dialog.component";
import { SalaryApi } from 'src/app/entities/salary/salary.api';
import { TransactionApi } from 'src/app/entities/transaction/transaction.api';
import { HistorySignModalComponent } from "../../../../../../shared/components/history-sign-modal/history-sign-modal";
import { PAYMENT_STATUS_META } from '../../../../../../shared/models/payment-status.model';
import { PreparePaymentUzsTransactionResponse } from '../../../../../../entities/transaction/transaction.model';
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import { UtilsService } from '../../../../../../core/services/utils.service';
import { ConfirmDialogComponent } from '../../../../../../shared/ui/confirm-dialog/confirm-dialog.component';
import { ExpiryDatePipe } from '../../../../../../shared/pipes/expiry-date.pipe';
import { ShortCardNumberPipe } from '../../../../../../shared/pipes/short-card-number.pipe';
import { cardStatusIcons } from '../../../../../../shared/models/card-status';
import {FirebaseAnalyticsService} from "../../../../../../../../firebase-analytics.service";
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

type ButtonType = 'primary' | 'secondary' | 'error';

@Component({
  selector: 'app-payroll-statement-detail',
  imports: [
    PageLayoutComponent,
    TableFiltersComponent,
    MinorToMajorPipe,
    IconComponent,
    NgClass,
    SlicePipe,
    TranslateModule,
    MatTooltip,
    DecimalPipe,
    ExpiryDatePipe,
    ShortCardNumberPipe,
    PaginationComponent,
  ],
  templateUrl: './payroll-statement-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollStatementDetailComponent {
  private readonly salaryApi = inject(SalaryApi);
  private readonly transactionApi = inject(TransactionApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly sanitizer = inject(DomSanitizer);
  public userService = inject(UserService);
  private readonly salaryService = inject(SalaryProjectService);
  private readonly destroy = inject(DestroyRef)
  private readonly utilService = inject(UtilsService);

  private readonly reloadTransaction = signal(0);

  readonly page = signal(0);
  readonly size = signal(DEFAULT_PAGE_SIZE);

  public readonly buttons: Signal<{
    label: string;
    icon: IconName;
    type: ButtonType,
    hasPermission: boolean,
    fn: () => void
  }[]> = computed(() => {
    const transaction = this.transaction();
    if (!transaction) return [];

    const buttons: { label: string; icon: IconName; type: ButtonType, hasPermission: boolean,  fn: any }[] = [];
    switch (transaction.status) {
      case 'PREPARE':
      case 'AUTO_PAY':
        buttons.push(
          {
            label: this.translate.instant('salaryStatements.sign'),
            icon: 'pencil02Bold',
            type: 'primary',
            hasPermission: this.userService.hasAction('SALARY') && transaction.canUserSign,
            fn: () => this.userService.hasAction('SALARY') && transaction.canUserSign ? this.onSubAction(transaction) : {}
          },
          {
            label: this.translate.instant('accountStatements.download'),
            icon: 'fileDownload03',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.download(transaction) : {}
          },
          {
            label: this.translate.instant('salaryStatements.edit'),
            icon: 'edit02',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.router.navigate(['edit'], { relativeTo: this.route }) : {}
          },
          {
            label: this.translate.instant('accountStatements.retry'),
            icon: 'refreshCw01',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.router.navigate(['repeat'], { relativeTo: this.route }): {}
          },
          {
            label: this.translate.instant('loans.payment_details'),
            icon: 'file06', type: 'secondary',
            hasPermission: true,
            fn: () => this.openDetailDialog()
          },
          {
            label: this.translate.instant('salaryStatements.delete'),
            icon: 'x',
            type: 'error',
            hasPermission: true,
            fn: () => this.cancelTransactions(transaction.id)
          },
        );
        break;
      case 'IN_PROCESS':
        buttons.push(
          {
            label: this.translate.instant('accountStatements.download'),
            icon: 'fileDownload03',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => {
              this.userService.hasAction('SALARY') ? this.download(transaction) : {}
            }
          },
          {
            label: this.translate.instant('accountStatements.retry'),
            icon: 'refreshCw01',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.router.navigate(['repeat'], { relativeTo: this.route }) : {}
          },
          {
            label: this.translate.instant('loans.payment_details'),
            icon: 'file06', type: 'secondary',
            hasPermission: true,
            fn: () => this.openDetailDialog()
          },
        );
        break;
      case 'SUCCESS':
      case 'PARTIAL_SUCCESS':
        buttons.push(
          {
            label: this.translate.instant('accountStatements.download'),
            icon: 'fileDownload03',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.downloadPdf(transaction) : {}
          },
          {
            label: this.translate.instant('accountStatements.retry'),
            icon: 'refreshCw01',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.router.navigate(['repeat'], { relativeTo: this.route }) : {}
          },
          {
            label: this.translate.instant('loans.payment_details'),
            icon: 'file06', type: 'secondary',
            hasPermission: true,
            fn: () => this.openDetailDialog()
          },
        );
        break;
      default:
        buttons.push(
          {
            label: this.translate.instant('accountStatements.download'),
            icon: 'fileDownload03',
            type: 'secondary',
            hasPermission: this.userService.hasAction('SALARY'),
            fn: () => this.userService.hasAction('SALARY') ? this.download(transaction) : {}
          },
          {
            label: this.translate.instant('loans.payment_details'),
            icon: 'file06', type: 'secondary',
            hasPermission: true,
            fn: () => this.openDetailDialog()
          },
        );
        break;
    }

    return buttons;
  })

  readonly bgColorByType: Record<ButtonType, string> = {
    primary: 'bg-[#00a38d]',
    secondary: 'bg-surface-2',
    error: 'bg-[#fb374829]',
  };

  readonly iconColorByType: Record<ButtonType, string> = {
    primary: 'fill-[#fff]',
    secondary: 'fill-[#00a38d]',
    error: 'fill-[#e93544]',
  };

  readonly borderColorByType: Record<ButtonType, string> = {
    primary: 'border-custom-border',
    secondary: 'border-custom-border',
    error: 'border-[#fb37483d]',
  };

  public readonly filterConfig: FilterConfig[] = [
    { name: 'searchText', type: 'search', placeholder: 'Поиск' },
    {
      name: 'status',
      type: 'select',
      placeholder: 'Статус',
      options: [
        {
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="12" rx="6" transform="matrix(1 0 0 -1 0 12)" fill="#9B47FF"/><path d="M5.30767 8.40404C5.36862 8.35963 5.42122 8.30697 5.48082 8.2473L8.10586 5.62225L6.37726 3.89365L3.75222 6.51869C3.69254 6.57829 3.63988 6.63089 3.59547 6.69184C3.5564 6.74548 3.523 6.80302 3.49582 6.86356C3.46493 6.93235 3.44539 7.00418 3.42325 7.08556L3.01126 8.59623C2.98111 8.70676 3.0125 8.82498 3.09352 8.90599C3.17453 8.98701 3.29275 9.0184 3.40328 8.98825L4.91395 8.57626C4.99533 8.55412 5.06716 8.53458 5.13595 8.50369C5.19649 8.47651 5.25404 8.44311 5.30767 8.40404Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.32179 3.02295C7.41797 2.9917 7.52158 2.9917 7.61777 3.02295C7.69204 3.04708 7.74587 3.08717 7.78133 3.11727C7.81193 3.14325 7.84403 3.17538 7.87091 3.20228L8.79723 4.12859C8.82413 4.15548 8.85626 4.18758 8.88224 4.21818C8.91234 4.25364 8.95243 4.30747 8.97656 4.38175C9.00781 4.47793 9.00781 4.58154 8.97656 4.67772C8.95243 4.752 8.91234 4.80583 8.88224 4.84129C8.85626 4.8719 8.82412 4.904 8.79722 4.93089L8.44918 5.27893L6.72058 3.55034L7.06863 3.20229C7.09551 3.17538 7.12762 3.14325 7.15822 3.11727C7.19369 3.08717 7.24751 3.04708 7.32179 3.02295Z" fill="white"/></svg>'),
          label: this.translate.instant('loans.for_signature'),
          value: 'PREPARE'
        },
        {
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="12" height="12" rx="6" transform="matrix(1 0 0 -1 0 12)" fill="#0099B5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4 3.27273C4 3.1221 4.09949 3 4.22222 3H7.77778C7.90051 3 8 3.1221 8 3.27273C8 3.42335 7.90051 3.54545 7.77778 3.54545H7.55557L7.55558 4.05466C7.55567 4.24948 7.55573 4.39662 7.52505 4.53657C7.49801 4.65994 7.45352 4.77651 7.39361 4.88099C7.32564 4.99951 7.2335 5.09364 7.1115 5.21828L6.34714 6L7.1115 6.78172C7.2335 6.90636 7.32564 7.00049 7.39361 7.11901C7.45352 7.22349 7.49801 7.34007 7.52505 7.46343C7.55573 7.60338 7.55567 7.75052 7.55558 7.94534L7.55557 8.45455H7.77778C7.90051 8.45455 8 8.57665 8 8.72727C8 8.8779 7.90051 9 7.77778 9H4.22222C4.09949 9 4 8.8779 4 8.72727C4 8.57665 4.09949 8.45455 4.22222 8.45455H4.44446L4.44445 7.94534C4.44437 7.75052 4.4443 7.60338 4.47498 7.46343C4.50203 7.34007 4.54652 7.22349 4.60643 7.11901C4.67439 7.00049 4.76653 6.90636 4.88854 6.78171L5.6529 6L4.88854 5.21828C4.76653 5.09364 4.67439 4.99951 4.60643 4.88099C4.54652 4.77651 4.50203 4.65994 4.47498 4.53657C4.4443 4.39662 4.44437 4.24948 4.44445 4.05466L4.44446 3.54545H4.22222C4.09949 3.54545 4 3.42335 4 3.27273ZM4.88891 4.02322V3.54545H7.11113V4.02322C7.11113 4.26336 7.10934 4.33339 7.09587 4.39486C7.08235 4.45654 7.0601 4.51483 7.03015 4.56707C7.00029 4.61912 6.9576 4.66564 6.80728 4.81937L6.00002 5.64499L5.19275 4.81937C5.04243 4.66564 4.99974 4.61912 4.96989 4.56707C4.93994 4.51483 4.91769 4.45654 4.90417 4.39486C4.89069 4.33339 4.88891 4.26336 4.88891 4.02322Z" fill="white"/></svg>'),
          label: this.translate.instant('salaryStatements.in_progress'),
          value: 'IN_PROCESS'
        },
        {
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM8.84024 4.74933C9.05325 4.53632 9.05325 4.19096 8.84024 3.97794C8.62723 3.76493 8.28186 3.76493 8.06885 3.97794L5.18182 6.86497L3.93115 5.61431C3.71814 5.40129 3.37277 5.40129 3.15976 5.61431C2.94675 5.82732 2.94675 6.17268 3.15976 6.38569L4.79612 8.02206C5.00914 8.23507 5.3545 8.23507 5.56751 8.02206L8.84024 4.74933Z" fill="#1FC16B"/></svg>'),
          label: this.translate.instant('salaryStatements.executed'),
          value: 'SUCCESS'
        },
        {
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0ZM8.84024 4.74933C9.05325 4.53632 9.05325 4.19096 8.84024 3.97794C8.62723 3.76493 8.28186 3.76493 8.06885 3.97794L5.18182 6.86497L3.93115 5.61431C3.71814 5.40129 3.37277 5.40129 3.15976 5.61431C2.94675 5.82732 2.94675 6.17268 3.15976 6.38569L4.79612 8.02206C5.00914 8.23507 5.3545 8.23507 5.56751 8.02206L8.84024 4.74933Z" fill="#FA7319"/></svg>'),
          label: this.translate.instant('salaryStatements.partially_executed'),
          value: 'PARTIAL_SUCCESS'
        },
        {
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0Z" fill="#FF4433"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.65431 3.38111C6.65431 3.01961 6.36126 2.72656 5.99976 2.72656C5.63826 2.72656 5.34521 3.01961 5.34521 3.38111V5.99929C5.34521 6.36079 5.63826 6.65384 5.99976 6.65384C6.36126 6.65384 6.65431 6.36079 6.65431 5.99929V3.38111ZM5.99976 7.96293C5.63826 7.96293 5.34521 8.25598 5.34521 8.61747C5.34521 8.97897 5.63826 9.27202 5.99976 9.27202H6.00631C6.3678 9.27202 6.66085 8.97897 6.66085 8.61747C6.66085 8.25598 6.3678 7.96293 6.00631 7.96293H5.99976Z" fill="white"/></svg>'),
          label: this.translate.instant('accountStatements.error'),
          value: 'ERROR'
        },

      ]
    },
  ];

  constructor(
    private analyticsService: FirebaseAnalyticsService
  ) {
  }
  public readonly searchText = signal('');
  public readonly statuses = signal<string[]>(
    [], { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) }
  );

  public readonly transaction = toSignal(
    toObservable(this.reloadTransaction).pipe(
      startWith(0),
      switchMap(() => {
        return this.transactionApi.getTransactionById(this.route.snapshot.paramMap.get('transactionId')!);
      })
    ),
    { initialValue: null }
  );

  public readonly childTransactionsRaw = toSignal(
    toObservable(this.transaction).pipe(
      filter((transaction) => !!transaction),
      switchMap(transaction => {
        return this.salaryApi.getEmployeesByTransactionId(transaction.id)
      })
    ), { initialValue: [] }
  );

  public readonly childTransactionsFiltered = computed(() => {
    const list = this.childTransactionsRaw();
    const search = this.searchText().trim().toLowerCase();
    const statuses = this.statuses();

    if (!list) return [];

    return list.filter(item => {
      const fitsSearch = item.ownerName.toLowerCase().includes(search);
      const fitsStatus = !statuses.length || statuses.includes(item.status);
      return fitsSearch && fitsStatus;
    });
  });

  public readonly childTransactions = computed(() => {
    const filtered = this.childTransactionsFiltered();
    const start = this.page() * this.size();
    return filtered.slice(start, start + this.size());
  });

  public readonly total = computed(() => this.childTransactionsFiltered().length);

  filterChange(value: { searchText: string; status: string }) {
    this.searchText.update(() => value.searchText);
    this.statuses.update(() => value.status ? [value.status] : []);
    this.page.set(0);
  }

  onSubAction(transaction: PreparePaymentUzsTransactionResponse) {
    const dialog = this.dialog.open(HistorySignModalComponent, {
      data: {
        action: {
          externalId: transaction.id,
          action: 'SIGN_AND_SEND',
          type: transaction.transactionMode,
          successMessage: 'Успешно!'
        },
        transactionId: transaction.id,
        transaction: transaction
      }
    });
    dialog.componentInstance.onDetail.subscribe(() => {
      this.reloadTransaction.update(v => v + 1);
      dialog.close();
    });
  }

  openDetailDialog() {
    this.dialog.open(PayrollStatementDetailDialogComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: { transaction: this.transaction(), childLength: this.childTransactions()?.length ?? 0 },
    });
  }

  download(transaction: PreparePaymentUzsTransactionResponse) {
    if (transaction) {
      this.salaryService.getSalaryExcelFileWithStatus(transaction.id).pipe(takeUntilDestroyed(this.destroy))
        .subscribe(res => {
          if (res?.msg) {
            const link = document.createElement('a');
            link.href = res.msg;
            link.download = 'salary-cards.xlsx';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
            link.remove();
          }
        });
    }
  }
  downloadPdf(transaction: PreparePaymentUzsTransactionResponse) {
    if (transaction) {
      this.salaryService.getSalaryPdfFileWithStatus(transaction.id).pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: (res: any) => {
            if (res.file) {
              const byteCharacters = atob(res.file);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], {type: 'application/pdf'});

              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `document_${transaction.name}.pdf`;
              link.click();

              URL.revokeObjectURL(link.href);
            }
          },
          error: (err) => {
            console.error('Ошибка при скачивании файла', err);
          }
        });
    }
  }

  cancelTransactions(transactionId: string) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        icon: 'alertTriangle',
        title: 'Вы действительно хотите удалить ведомость?',
        description: 'После удаления ведомости восстановить её будет невозможно',
      },
      width: '480px',
    }).afterClosed().subscribe((res) => {
      if (res === 'confirm') {
        this.utilService.spinnerState$$.next(true);

        this.transactionApi.deleteTransactions([transactionId]).subscribe(res => {
          this.analyticsService.logFirebaseCustomEvent('delete_transfer_success', {transfer_id: transactionId});

          this.router.navigate(['payroll-project', 'statements']);
          this.utilService.spinnerState$$.next(false);
        })
      }
    });
  }

  protected readonly PAYMENT_STATUS_META = PAYMENT_STATUS_META;
  protected readonly cardStatusIcons = cardStatusIcons;
}
