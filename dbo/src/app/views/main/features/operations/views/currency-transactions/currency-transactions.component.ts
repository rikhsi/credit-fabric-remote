import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { TableActionsComponent } from '../../../../../../shared/components/table-actions/table-actions.component';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { OperationsFilterComponent } from '../../components/operations-filter/operations-filter.component';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransactionContent } from '../../../accounts-payments/models/accounts-payments.model';
import { TableButton } from '../../../../../../shared/interfaces/table-button.interface';
import { tableActionBtns } from '../../utils/btn.state';
import { tableColumnsCurrencyApplication, tableColumnsCurrencyTransaction } from '../../utils/table-fields';
import { ApplicationsService } from '../../../applications/services/applications.service';
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {
  ContainerSearchInputComponent
} from "../../../../../../shared/components/common/container-search-input/container-search-input.component";
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { NgOptimizedImage } from '@angular/common';
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { MatDialog } from '@angular/material/dialog';
import { SwiftFilterComponent } from '../../../../../../shared/components/swift-filter/swift-filter.component';
import { IApplicationFilter } from '../../../../../../shared/interfaces/applications.interface';
import {
  ApplicationDetailComponent
} from '../../../../../../shared/components/application-detail/application-detail.component';
import { SwiftDetailComponent } from '../../../../../../shared/components/swift-detail/swift-detail.component';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AgreeModalComponent } from '../../../../../../shared/components/agree-modal/agree-modal.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { getStatusApplication } from '../../../../../../core/utils/mixin.utils';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { ExcelService } from '../../../../../../core/services/excel.service';
import { OperationsService } from '../../services/operations.service';

@Component({
    selector: 'app-currency-transactions',
    imports: [
        TableActionsComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        OperationsFilterComponent,
        ContainerTableComponent,
        PaginatorComponent,
        FilterButtonComponent,
        ContainerSearchInputComponent,
        MatMenu,
        NgOptimizedImage,
        MatMenuTrigger,
        SwiftFilterComponent
    ],
    templateUrl: './currency-transactions.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyTransactionsComponent implements OnInit {
  title = 'Заявление на банковский перевод в иностранной валюте';
  create = {
    link: '/create-swift'
  }
  navs = [
    {
      title: 'Главная',
      link: '/'
    },
    {
      title: 'Валютные операции',
      link: '/operations'
    },
    {
      title: this.title,
      link: '/'
    },
  ];

  columnTitles = {
    date: 'Дата',
    id: 'ID Заявления',
    receiverName: 'Наименование контрагента',
    accountNumber: 'Счет плательщика',
    amount: 'Сумма',
    status: 'Статус',
  };

  tableActionBtns: TableButton[] = tableActionBtns;

  tableColumns = tableColumnsCurrencyApplication;
  errorMessage = '';

  tableData: TransactionContent[] = [];
  selectedRows: any[] =[];

  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  swiftFilterState = false;
  loading = false;

  pageChange(value: any) {
    this.pageIndex = +value.page;
    this.pageSize = +value.size;
    this.getSwiftTransactions();
  }
  filter!: IApplicationFilter;
  private destroyRef = inject(DestroyRef);

  constructor(
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private applicationsService: ApplicationsService,
    private _matDialog: MatDialog,
    private utilsService: UtilsService,
    private router: Router,
    private toastrService: ToastrService,
    private amountService: AmountService,
    private templateService: TemplateService,
    private excelService: ExcelService,
    private operationService: OperationsService,
  ) {
  }

  sign(value: any) {
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: { applicationId: value.swiftApplicationDto.transactionId },
    });
  }

  ngOnInit() {
    this.watchApplicationEsp();
  }

  getSwiftTransactions() {
    this.loading = true;
    this.applicationsService.getApplications(
      {
        ...this.filter,
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
        applicationTypes: ['SWIFT'],
      }
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (val: any) => {
          if(val) {
            this.totalItems = val.totalElements;
            this.pageSize = val.pageable.pageSize;
            this.pageIndex = val.pageable.pageNumber;
            this.tableData = val.content;
            this.errorMessage = '';
          }
        },
        error: (err: any) => {
          this.errorMessage = err || err.message || 'Что-то пошло не так!';
          this.loading = false;
          this._cdRef.markForCheck();
        },
        complete: () => {
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.getSwiftTransactions();
  }

  onActionClick(id: string) {
    if(id === 'instruction') {
      this.openInstructions();
    }
    if(id === 'delete') {
      this.deleteApplication();
    }
    if(id === 'swift') {
      const swift = this.selectedRows[0].swiftApplicationDto;
      if(!swift) return;
      swift.docDate = new Date(swift.docDate || Date.now()).toLocaleDateString('ru-Ru', {  year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      this.printSwiftMessage(this.selectedRows[0].swiftApplicationDto)
      // this.getMessage();
    }
    if(id === 'print') {
      this.printSelectedRows();
    }
    if(id === 'excel') {
      this.exportToExcel();
    }
  }

  openInstructions() {
    const a = window.document.createElement('a');
    a.href = 'https://hamkor.uz/uz/corporate/currency/';
    a.target = '_blank';
    a.click();
  }

  watchApplicationEsp() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if(res === 'update-swift') {
            this.getSwiftTransactions();
          }
        }
      })
  }

  deleteApplication() {
    const ids = this.selectedRows.map((el: any) => el.applicationId);
    this._matDialog.open(AgreeModalComponent, {
      data: {
        title: 'Вы действительно хотите удалить платёж?',
        agree: 'Да',
        cancel: 'Нет',
      }
    }).afterClosed()
      .subscribe({
        next: (res: any) => {
          if(res === 'agree') {
            this.deleteSelectedRows(ids);
          }
        }
      })
  }

  deleteSelectedRows(ids: any) {
    this.applicationsService.deleteApplications(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastrService.success('Успешно удалён!');
          this.getSwiftTransactions();
          this._cdRef.markForCheck();
        },
        error: (err) => {
          const errorMessage = (err.message || err || 'Что-то пошло не так!') as string;
          this.toastrService.error(errorMessage);
        }
      })
  }

  translateColumns(formatted: any) {
    const translated: any[] = formatted.map((el: any) => {
      const obj = {};

      Object.keys(el).forEach((key) => {
        // @ts-ignore
        obj[this.columnTitles[key]] = el[key];
      });

      return obj;
    });

    return translated;
  }

  exportToExcel() {
    const formatted = this.formatData();

    if(formatted) {
      const translated = this.translateColumns(formatted);

      this.excelService.exportToExcel(translated, 'swift-applications');
    }
  }

  async printSwiftMessage(data: any) {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: 'swift-message.mustache',
      templateData: data,
      templateName: 'SWIFT message'
    };
    await this.templateService.showPdfInDialog(options);
  }

  getMessage() {
    const id = this.selectedRows[0]?.applicationId;
    this.operationService.getSwiftMessage(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: async (data) => {
          if(data) {
            await this.printSwiftMessage(data);
          }
        },
        error: (err) => {
          this.toastrService.error(err.message || err || 'Что-то пошло не так...');
        }
      })
  }

  async printSelectedRows() {
    const formatted = this.formatData();


    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: 'swift-list.mustache',
      templateData: formatted,
      templateName: 'SWIFT платежи'
    };
    await this.templateService.showPdfInDialog(options);
  }

  formatData() {
    return this.selectedRows.map((el: any) => {
      let obj: any = {};
      obj.date = el.createdDate;
      obj.id = el.applicationId;
      obj.receiverName = el.swiftApplicationDto.beneficiary59Name;
      obj.accountNumber = el.swiftApplicationDto.senderAccount;
      obj.amount = this.amountService.convertToAmount(+el.swiftApplicationDto.senderAmount32);
      obj.status = getStatusApplication(el.applicationStatus).label;

      return obj;
    });
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  rowClick(value: any) {
    this._matDialog.open(SwiftDetailComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: value,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.getSwiftTransactions();
        }
      });
  }

  toggleForAnyElement() {
    if(this.selectedRows.length) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'print' || el.id === 'excel') {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'print' || el.id === 'excel') {
          el.active = false;
        }
      })
    }
  }

  toggleForOneElement() {
    if(this.selectedRows.length === 1) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete' || el.id === 'swift') {
          el.active = true;
        }
      })
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete' || el.id === 'swift') {
          el.active = false;
        }
      })
    }
  }
}
