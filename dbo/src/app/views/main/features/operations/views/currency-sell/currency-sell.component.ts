import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import { TableActionsComponent } from '../../../../../../shared/components/table-actions/table-actions.component';
import { ContainerNavComponent } from '../../../../../../shared/components/container-nav/container-nav.component';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { OperationsFilterComponent } from '../../components/operations-filter/operations-filter.component';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { TableButton } from '../../../../../../shared/interfaces/table-button.interface';
import { tableColumnsCurrencySellApplication, tableColumnsCurrencyTransaction } from '../../utils/table-fields';
import { TransactionContent } from '../../../accounts-payments/models/accounts-payments.model';
import { AccountsPaymentsService } from '../../../accounts-payments/services/accounts-payments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tableActionBtns } from '../../utils/btn.state';
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {
  ContainerSearchInputComponent
} from "../../../../../../shared/components/common/container-search-input/container-search-input.component";
import {
  CurrencyBuySellFilterFormComponent
} from "../../../../../../shared/components/currency-buy-sell-filter-form/currency-buy-sell-filter-form.component";
import {animate, state, style, transition, trigger} from "@angular/animations";
import { SwiftFilterComponent } from '../../../../../../shared/components/swift-filter/swift-filter.component';
import { IApplicationFilter } from '../../../../../../shared/interfaces/applications.interface';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Location, NgOptimizedImage } from '@angular/common';
import {
  EspSignApplicationComponent
} from '../../../../../../core/components/esp-sign-application/esp-sign-application.component';
import { MatDialog } from '@angular/material/dialog';
import {
  ApplicationDetailComponent
} from '../../../../../../shared/components/application-detail/application-detail.component';
import { AgreeModalComponent } from '../../../../../../shared/components/agree-modal/agree-modal.component';
import { ToastrService } from 'ngx-toastr';
import { DocModalComponent } from '../../../../../../shared/components/doc-modal/doc-modal.component';
import { AuthService } from '../../../../../auth/services/auth.service';

@Component({
    selector: 'app-currency-sell',
    imports: [
        TableActionsComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        OperationsFilterComponent,
        ContainerTableComponent,
        PaginatorComponent,
        FilterButtonComponent,
        UiSvgIconComponent,
        ContainerSearchInputComponent,
        CurrencyBuySellFilterFormComponent,
        SwiftFilterComponent,
        MatMenu,
        NgOptimizedImage,
        MatMenuTrigger
    ],
    animations: [
        trigger('expandCollapse', [
            state('collapsed', style({ height: '0px', padding: '0', margin: '0', opacity: 0 })),
            state('expanded', style({ height: '*', padding: '*', margin: '*', opacity: 1 })),
            transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
        ])
    ],
    templateUrl: './currency-sell.component.html',
    styles: `
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencySellComponent implements OnInit{
  title = 'Заявка на продажу иностранной валюты';
  create = {
    link: '/create-currency-sell',
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
  tableActionBtns: TableButton[] = tableActionBtns;

  tableColumns = tableColumnsCurrencySellApplication;

  tableData: TransactionContent[] = [];
  selectedRows: TransactionContent[] =[];

  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;


  pageChange(value: any) {
    this.pageIndex = +value.page;
    this.pageSize = +value.size;
    this.getSwiftTransactions();
  }
  filter: any;
  loading = false;
  errorMessage = '';
  private destroyRef = inject(DestroyRef);

  constructor(
    private applicationService: ApplicationsService,
    private _cdRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private toastrService: ToastrService,
    private authService: AuthService,
    private location: Location,
    private matDialog: MatDialog,
  ) {
  }

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.getSwiftTransactions();
  }

  ngOnInit() {
    // this.getSwiftTransactions();
    this.openPublicOffer();
  }

  openPublicOffer() {
    this.authService.getUserSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.matDialog.open(DocModalComponent, {
              width: '540px',
              height: '600px',
              data: { widget: res?.widget, url: './assets/word/public_offer_buy_sell.docx', publicOfferName: 'publicOfferCurrencySell' }
            }).afterClosed()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (res) => {
                  if(!res) {
                    this.location.back()
                  }
                }
              });

            if(!res.widget.publicOfferCross) {

            }
          }
        }
      })
  }

  getSwiftTransactions() {
    this.loading = true;
    this.applicationService.getApplications(
      {
        ...this.filter,
        pageNum: this.pageIndex,
        pageSize: this.pageSize,
        applicationTypes: ['CONVERSION_SELL']
      }
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: val => {
          if(val) {
            this.totalItems = val.totalElements;
            this.pageSize = val.pageable.pageSize;
            this.pageIndex = val.pageable.pageNumber;
            this.tableData = val.content;
            this.errorMessage = '';
            this._cdRef.markForCheck();
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
          this._cdRef.markForCheck();
        },
        complete: () => {
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  onActionClick(id: string) {
    if(id === 'instruction') {
      this.openInstructions();
    }
    if(id === 'delete') {
      this.deleteApplication();
    }
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
    this.applicationService.deleteApplications(ids)
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
  openInstructions() {
    const a = window.document.createElement('a');
    a.href = 'https://hamkor.uz/uz/corporate/currency/';
    a.target = '_blank';
    a.click();
  }

  openDetails(application: any) {
    this._matDialog.open(ApplicationDetailComponent, {
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

  sign(value: any) {
    this._matDialog.open(EspSignApplicationComponent, {
      width: '744px',
      data: { applicationId: value.swiftApplicationDto.transactionId },
    });
  }
}
