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
import { TableButton } from '../../../../../../shared/interfaces/table-button.interface';
import { tableColumnsCrossConversion, tableColumnsCurrencyTransaction } from '../../utils/table-fields';
import { TransactionContent } from '../../../accounts-payments/models/accounts-payments.model';
import { tableActionCrossBtns } from '../../utils/btn.state';
import {FilterButtonComponent} from "../../../../../../shared/components/common/filter-button/filter-button.component";
import {
  ContainerSearchInputComponent
} from "../../../../../../shared/components/common/container-search-input/container-search-input.component";
import { HttpClient } from '@angular/common/http';
import { DocModalComponent } from '../../../../../../shared/components/doc-modal/doc-modal.component';
import { AuthService } from '../../../../../auth/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { AgreeModalComponent } from '../../../../../../shared/components/agree-modal/agree-modal.component';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { ToastrService } from 'ngx-toastr';
import { SwiftFilterComponent } from '../../../../../../shared/components/swift-filter/swift-filter.component';
import { IApplicationFilter } from '../../../../../../shared/interfaces/applications.interface';
import { AppInfoComponent } from '../../../applications/components/app-info/app-info.component';

@Component({
    selector: 'app-conversion-operations',
    imports: [
        TableActionsComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        OperationsFilterComponent,
        ContainerTableComponent,
        PaginatorComponent,
        FilterButtonComponent,
        ContainerSearchInputComponent,
        SwiftFilterComponent
    ],
    templateUrl: './conversion-operations.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversionOperationsComponent implements OnInit {
  title = 'Конверсия (СКВ на СКВ)';
  create = {
    link: '/create-cross-conversion'
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

  tableActionBtns: TableButton[] = tableActionCrossBtns;

  tableColumns = tableColumnsCrossConversion;

  tableData: TransactionContent[] = [];
  selectedRows: TransactionContent[] =[];

  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;


  pageChange(value: any) {
    this.pageIndex = +value.page;
    this.pageSize = +value.size;
  }
  filter: any;
  private destroyRef = inject(DestroyRef);
  filterState = false;

  constructor(
    private accountsPaymentsService: AccountsPaymentsService,
    private _cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private matDialog: MatDialog,
    private location: Location,
    private applicationService: ApplicationsService,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit() {
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
              data: { widget: res?.widget, url: './assets/word/public_offer_cross.docx', publicOfferName: 'publicOfferCross' }
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

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.getSwiftTransactions();
  }

  getSwiftTransactions() {
    this.applicationService.getApplications(
      {
        ...this.filter,
        pageSize: this.pageSize,
        pageNum: this.pageIndex,
        applicationTypes: ['CONVERSION_CROSS'],
      }
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: any) => {
        if(val) {
          this.totalItems = val.totalElements;
          this.pageSize = val.pageable.pageSize;
          this.pageIndex = val.pageable.pageNumber;
          this.tableData = val.content.map((el: any) => {
            const obj = el;
            obj.exchangeCurrency = `${el.conversionApplicationDto.senderCurrency}/${el.conversionApplicationDto.receiverCurrency}`;
            return obj;
          });
          this._cdRef.markForCheck();
        }
      })
  }

  onActionClick(id: string) {
    if(id === 'instruction') {
      this.openInstructions();
    }
    if(id === 'reminder') {
      this.getReminder();
    }
    if(id === 'delete') {
      this.deleteApplication();
    }
  }


  deleteApplication() {
    const ids = this.selectedRows.map((el: any) => el.applicationId);
    this.matDialog.open(AgreeModalComponent, {
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
    a.href = 'https://Hamkor.uz/uz/corporate/currency/';
    a.target = '_blank';
    a.click();
  }

  getReminder() {
    const a = window.document.createElement('a');
    a.href = './assets/pdf/reminder.pdf';
    a.target = '_blank';
    a.click();
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForOneElement();
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  openDetail(application: any) {
    this.matDialog.open(AppInfoComponent, {
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
