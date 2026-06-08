import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
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
import { tableColumnsCurrencyBuyApplication, tableColumnsCurrencyTransaction } from '../../utils/table-fields';
import { tableActionBtns } from '../../utils/btn.state';
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {
  ContainerSearchInputComponent
} from "../../../../../../shared/components/common/container-search-input/container-search-input.component";
import {
  CurrencyBuySellFilterFormComponent
} from "../../../../../../shared/components/currency-buy-sell-filter-form/currency-buy-sell-filter-form.component";
import { Location, NgIf } from '@angular/common';
import {animate, state, style, transition, trigger} from "@angular/animations";
import { SwiftFilterComponent } from '../../../../../../shared/components/swift-filter/swift-filter.component';
import { IApplicationFilter } from '../../../../../../shared/interfaces/applications.interface';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { TransactionDetailComponent } from '../../../transaction-detail/transaction-detail.component';
import {
  ApplicationDetailComponent
} from '../../../../../../shared/components/application-detail/application-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { getStatusApplication } from '../../../../../../core/utils/mixin.utils';
import { Options, TemplateService } from '../../../../../../core/services/template.service';
import { ExcelService } from '../../../../../../core/services/excel.service';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { ToastrService } from 'ngx-toastr';
import { AgreeDialogComponent } from '../../../../../../core/components/agree-dialog/agree-dialog.component';
import { AgreeModalComponent } from '../../../../../../shared/components/agree-modal/agree-modal.component';
import { DocModalComponent } from '../../../../../../shared/components/doc-modal/doc-modal.component';
import { AuthService } from '../../../../../auth/services/auth.service';

@Component({
    selector: 'app-currency-buy',
    imports: [
        TableActionsComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        OperationsFilterComponent,
        ContainerTableComponent,
        PaginatorComponent,
        FilterButtonComponent,
        ContainerSearchInputComponent,
        CurrencyBuySellFilterFormComponent,
        NgIf,
        SwiftFilterComponent
    ],
    animations: [
        trigger('expandCollapse', [
            state('collapsed', style({ height: '0px', padding: '0', margin: '0', opacity: 0 })),
            state('expanded', style({ height: '*', padding: '*', margin: '*', opacity: 1 })),
            transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
        ])
    ],
    templateUrl: './currency-buy.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyBuyComponent implements OnInit {
  title = 'Заявка на покупку иностранной валюты';
  create = {
    link: '/create-currency-buy'
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
  filterState = false;

  idns: any[] = [];

  tableActionBtns: TableButton[] = tableActionBtns;

  tableColumns = tableColumnsCurrencyBuyApplication;

  tableData: TransactionContent[] = [];
  selectedRows: TransactionContent[] =[];

  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  loading = false;
  errorMessage = '';


  pageChange(value: any) {
    this.pageIndex = +value.page;
    this.pageSize = +value.size;
  }
  filter: any;
  private destroyRef = inject(DestroyRef);

  constructor(
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private applicationService: ApplicationsService,
    private matDialog: MatDialog,
    private templateService: TemplateService,
    private excelService: ExcelService,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private authService: AuthService,
    private location: Location,
  ) {
  }

  ngOnInit() {
    this.getSwiftTransactions();
    this.watchApplicationEsp();
    // this.openPublicOffer();
  }

  openPublicOffer() {
    this.authService.getUserSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            if(!res.widget.publicOfferCurrencyBuy) {
              this.openOffer(res);
            }
          }
        }
      })
  }

  openOffer(res: any) {
    this.matDialog.open(DocModalComponent, {
      width: '540px',
      height: '600px',
      data: { widget: res?.widget, url: './assets/word/public_offer_buy_sell.docx', publicOfferName: 'publicOfferCurrencyBuy' }
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(!res) {
            this.location.back()
          }
        }
      });
  }

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.getSwiftTransactions();
  }

  getSwiftTransactions() {
    this.loading = true;
    this.applicationService.getApplications({
      pageNum: this.pageIndex,
      pageSize: this.pageSize,
      ...this.filter,
      applicationTypes: ['CONVERSION_BUY'],
      },
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: val => {
          if(val) {
            this.totalItems = val.totalElements;
            this.pageSize = val.pageable.pageSize;
            this.pageIndex = val.pageable.pageNumber;
            this.tableData = val.content;
            this.errorMessage = '';
            this.loading = false;
            this._cdRef.markForCheck();
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
          this._cdRef.markForCheck();
        },
        complete: () => {

        }
      })
  }

  onActionClick(id: string) {
    if(id === 'print') {
      this.printRows();
    }
    if(id === 'excel') {
      this.downloadExcel();
    }
    if(id === 'delete') {
      this.deleteApplication();
    }

    if(id === 'instruction') {
      this.openInstructions();
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
          if(res === 'update-currency-buy' || 'update') {
            this.getSwiftTransactions();
          }
        }
      })
  }

  deleteApplication() {
    let invalid = false;
    const ids = this.selectedRows.map((el: any) => {
      if(el.applicationStatus !== 'NEW') {
        invalid = true;
      }
      return el.applicationId;
    });

    if(invalid) {
      this.toastrService.error(`Можно удалить только созданные заявки`);
      return;
    }

    this.matDialog.open(AgreeModalComponent, {
      data: {
        title: 'Вы действительно хотите удалить заявление'
      }
    }).afterClosed()
      .subscribe((res: any) => {
        if(res === 'agree') {
          this.applicationService.deleteApplications(ids)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (res: any) => {
                if(res) {
                  this.toastrService.success('Заявки удалены!');
                  this.getSwiftTransactions();
                }
              },
              error: (err: any) => {
                this.toastrService.error(err.message || err || 'Ошиюка при удалении');
              }
            });
        }
      });
  }

  openDetails(application: any) {
    this.matDialog.open(ApplicationDetailComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: application,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.getSwiftTransactions();
        }
      });
  }

  async printRows() {
    const formatted = this.formatData();

    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: '/conversion-buy.mustache',
      templateData: formatted,
      templateName: 'Покупка валюты',
    };

    await this.templateService.showPdfInDialog(options);
  }

  downloadExcel() {
    const formatted = this.formatData();

    const translated: any[] = formatted.map((el: any) => {
      const obj = {};

      Object.keys(el).forEach((key) => {
        // @ts-ignore
        obj[this.translateKey(key)] = el[key];
      });

      return obj;
    });

    this.excelService.exportToExcel(translated, 'currency-buy');
  }

  formatData() {
    return this.selectedRows.map((el: any) => {
      const obj: any = {};
      obj.applicationId = el.applicationId;
      obj.date = new Date(el.createdDate).toLocaleDateString('ru-Ru');
      obj.docNum = el.conversionApplicationDto.docNum;
      obj.rate = this.formatAmount(el.conversionApplicationDto.rate);
      obj.amountCurr = this.formatAmount(el.conversionApplicationDto?.receiverAmount);
      obj.curr = el.conversionApplicationDto.receiverCurrency;
      obj.amount = this.formatAmount(el.conversionApplicationDto?.senderAmount);
      obj.status = getStatusApplication(el.applicationStatus).label;
      return obj;
    });
  }

  translateKey(key: string): string {
    const translations: Record<string, string> = {
      applicationId: 'ID Заявки',
      date: 'Дата',
      docNum: 'Номер Документа',
      rate: 'Курс',
      amountCurr: 'Сумма в Валюте',
      curr: 'Валюта',
      amount: 'Сумма',
      status: 'Статус'
    };
    return translations[key] || key; // Default to original key if no translation is found
  }

  formatAmount(amount: number) {
    return `${Math.floor(amount / 100)},${(amount%100).toString().padStart(2, '0')}`
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  toggleForAnyElement() {
    if(this.selectedRows.length) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'print' || el.id === 'excel' || el.id === 'delete') {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'print' || el.id === 'excel' || el.id === 'delete') {
          el.active = false;
        }
      })
    }
  }

  toggleForOneElement() {
    if(this.selectedRows.length === 1) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'swift') {
          el.active = true;
        }
      })
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'swift') {
          el.active = false;
        }
      })
    }
  }
}
