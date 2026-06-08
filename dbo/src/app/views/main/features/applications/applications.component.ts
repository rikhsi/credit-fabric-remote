import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { appTabs, appTypesTranslate } from './constants/app-tab';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationsService } from './services/applications.service';
import {
  ContainerTableComponent
} from '../../../../shared/components/common/container-table/container-table.component';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import { ApplicationTableColumn } from './constants/table-column';
import { ContainerTitleComponent } from '../../../../shared/components/container-title/container-title.component';
import { AppFilterComponent } from './components/app-filter/app-filter.component';
import { SwiftFilterComponent } from '../../../../shared/components/swift-filter/swift-filter.component';
import { IApplicationFilter } from '../../../../shared/interfaces/applications.interface';
import { MatDialog } from '@angular/material/dialog';
import { UtilsService } from '../../../../core/services/utils.service';
import { FilterButtonComponent } from '../../../../shared/components/common/filter-button/filter-button.component';
import { TableActionsComponent } from '../../../../shared/components/table-actions/table-actions.component';
import { tableAppsActionBtns } from './constants/action-btns';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { AgreeModalComponent } from '../../../../shared/components/agree-modal/agree-modal.component';
import { ToastrService } from 'ngx-toastr';
import { AppInfoComponent } from './components/app-info/app-info.component';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { SelectActionComponent } from '../../../../shared/components/select-action/select-action.component';
import { EspSignConfirmComponent } from '../../../../core/components/esp-sign-confirm/esp-sign-confirm.component';
import { SwiftDetailComponent } from '../../../../shared/components/swift-detail/swift-detail.component';

@Component({
    selector: 'app-applications',
    imports: [
        RouterLinkActive,
        RouterLink,
        ContainerTableComponent,
        PaginatorComponent,
        ContainerTitleComponent,
        AppFilterComponent,
        SwiftFilterComponent,
        FilterButtonComponent,
        TableActionsComponent,
        NgClass,
        NgOptimizedImage,
        MatMenu,
        MatMenuTrigger,
        MatMenuItem,
        SelectActionComponent
    ],
    templateUrl: './applications.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsComponent implements OnInit {
  title = 'Мои заявки';
  tabs = appTabs;
  activeTab = '';

  loading = false;
  errorMessage = '';
  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  filterState = false;
  selectedRows: any[] =[];

  tableActionBtns = tableAppsActionBtns;

  apps!: any[];
  filter!: IApplicationFilter;

  constructor(
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
    private _applicationService: ApplicationsService,
    private matDialog: MatDialog,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit() {
    this.watchUpdate();
  }

  watchUpdate() {
    this.utilsService.updateTransactions
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message: string) => {
        if(message === 'update-applications') {
          this.getApplications();
        }
      })
  }

  onActionClick(id: string) {
    if(id === 'delete') {
      this.deleteApplication();
    }
  }

  getActions() {
    if(this.selectedRows.length > 0) {
      return this.selectedRows[0].buttons.map(action => ({
        id: action.actionType,
        title: action.name,
      }));
    }
    return [];
  }

  handleAction(action: any) {
    if(this.selectedRows.length <= 0) {
      const message = 'Выберите транзакцию для действия!';
      return;
    }

    if(!this.checkForUniqueStatus()) {
      const message = 'Выбранные строки должны быть одинакового статуса!';
      this.toastrService.info(message);
      return;
    }

    const applicationDetails = this.selectedRows.map(row => ({
      id: row.conversionApplicationDto?.transactionId ||
        row.depositOpenApplicationRes?.transactionId ||
        null,
      applicationId: row.applicationId,
    }));

    this.matDialog.open(EspSignConfirmComponent, {
      width: '744px',
      data: {
        action: {
          applicationDetails,
          action: action.id,
          successMessage: 'Успешно!',
          isApplication: true,
        },
        transaction: {}
      },
    }).afterClosed()
      .subscribe({
        next: res => {
          if(res === 'update') {
            this.getApplications();
          }
        }
      });
  }

  checkForUniqueStatus() {
    return new Set(this.selectedRows.map(obj => obj.status)).size === 1;
  }


  getApplications() {
    this.loading = true
    this._applicationService.getApplications({
      ...this.filter,
      pageSize: this.pageSize,
      pageNum: this.pageIndex,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!res) return;
          this.errorMessage = '';
          this.loading = false;
          this.pageIndex = res.number;
          this.pageSize = res.size;
          this.totalItems = res.totalElements;
          this.apps = res.content;
          this.addType();
          if(this.activeTab === 'CONVERSION_CROSS' && res.content?.length) {
            this.addCurrencies();
          }
          this._cdRef.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err.message || err || 'Что-то пошло не так...';
          this.apps = [];
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  addCurrencies() {
    this.apps.forEach((el: any) => {
      el.exchangeCurrency = `${el.conversionApplicationDto.senderCurrency}/${el.conversionApplicationDto.receiverCurrency}`;
    });
  }

  addType() {
    this.apps.forEach((el: any) => {
      el.type = (appTypesTranslate as any)[el.applicationType];
    });
  }

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getApplications();
  }

  openDetails(application: any) {
    if(application.applicationType === 'SWIFT') {
      this.openSwiftDetails(application);
      return;
    }
    this.matDialog.open(AppInfoComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: application,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.getApplications();
        }
      });
  }

  openSwiftDetails(application: any) {
    this.matDialog.open(SwiftDetailComponent, {
      width: '550px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: application,
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
          this.getApplications();
        }
      });
  }

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.getApplications();
  }

  onSelectedRows(event: any) {
    this.selectedRows = event;
    this.toggleForAnyElement();
    this.tableActionBtns = [...this.tableActionBtns];

    this._cdRef.detectChanges();
  }

  toggleForAnyElement() {
    if(this.selectedRows.length) {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete') {
          el.active = true;
        }
      });
    } else {
      this.tableActionBtns.forEach(el => {
        if(el.id === 'delete') {
          el.active = false;
        }
      })
    }
  }

  deleteApplication() {
    const ids = this.selectedRows.map((el: any) => el.applicationId);
    this.matDialog.open(AgreeModalComponent, {
      data: {
        title: 'Вы действительно хотите удалить заявления?',
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
    this._applicationService.deleteApplications(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.toastrService.success('Успешно удалён!');
          this.getApplications();
          this._cdRef.markForCheck();
        },
        error: (err) => {
          const errorMessage = (err.message || err || 'Что-то пошло не так!') as string;
          this.toastrService.error(errorMessage);
        }
      })
  }

  protected readonly ApplicationTableColumn = ApplicationTableColumn;
}
