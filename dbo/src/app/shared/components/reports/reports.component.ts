import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnDestroy,
  OnInit, Output
} from '@angular/core';
import { tableAppsActionBtns } from '../../../views/main/features/applications/constants/action-btns';
import { FilterButtonComponent } from '../common/filter-button/filter-button.component';
import { TableActionsComponent } from '../table-actions/table-actions.component';
import {
  AppFilterComponent
} from '../../../views/main/features/applications/components/app-filter/app-filter.component';
import { IApplicationFilter } from '../../interfaces/applications.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationsService } from '../../../views/main/features/applications/services/applications.service';
import { ReportCardComponent } from '../report-card/report-card.component';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { filter, interval, Subscription, switchMap, takeWhile } from 'rxjs';
import internal from 'node:stream';
import { slideInAnimation } from '../../animations/slide-in.animation';
import { query, style, transition, trigger } from '@angular/animations';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-reports',
    imports: [
        FilterButtonComponent,
        TableActionsComponent,
        AppFilterComponent,
        ReportCardComponent,
        MatDivider,
        MatProgressSpinner
    ],
    templateUrl: './reports.component.html',
    styles: ``,
    animations: [
        slideInAnimation
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  private appSubs!: Subscription | undefined;
  hasNew = false;
  filterState = false;
  filter!: IApplicationFilter;
  applicationTypes = ['REPORT'];

  tab = '';

  @Input() loadingExcel = false;
  @Input() reloadReports!: EventEmitter<void>;
  @Output() loadingReports = new EventEmitter<boolean>(false);

  loading = false;
  errorMessage = '';
  pageSize = 20;
  pageIndex = 0;
  totalItems = 0;

  apps: any[] = [];

  constructor(
    private destroyRef: DestroyRef,
    private _applicationService: ApplicationsService,
    private _cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
  ) {
  }

  ngOnInit() {
    this.watchRoute();
    this.watchApplication();
    this.watchReload();
    this.watchNotification();
  }

  ngOnDestroy() {
  }

  watchNotification() {
    this.notificationService.reportsReady$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ready => {
        this.getApplications();
      });
  }

  watchReload() {
    this.reloadReports.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadingReports.emit(true);
        this.stopPolling();
        this.getApplications();
      })
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(param => {
        this.tab = param['tab'];
        this.updateApplicationType();
        this.getApplications();
      });
  }

  watchApplication() {
    this._applicationService.$applicationState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.updateApplicationType();
        this.getApplications();
      });
  }

  updateApplicationType() {
    this.applicationTypes = this.tab === 'history' ? ['REPORT'] : ['REPORT_INFO'];
  }

  startPolling() {
    this.appSubs = interval(10000)
      .pipe(
        takeWhile(() => this.hasNew),
        filter(() => this.hasNew),
        switchMap(() => this._applicationService.getApplications({
          ...this.filter,
          applicationTypes: this.applicationTypes,
          pageSize: this.pageSize,
          pageNum: this.pageIndex,
        })),
      )
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.loadingReports.emit(false);
          }, 600)
          if (!res) return;
          this.errorMessage = '';
          this.loading = false;
          this.pageIndex = res.number;
          this.pageSize = res.size;
          this.totalItems = res.totalElements;
          this.apps = res.content;
          this.checkForNew();
          this._cdRef.markForCheck();
        },
        error: (err) => {
          setTimeout(() => {
            this.loadingReports.emit(false);
          }, 600)
          this.errorMessage = err.message || err || 'Что-то пошло не так...';
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  stopPolling() {
    if (this.appSubs) {
      this.appSubs.unsubscribe();
      this.appSubs = undefined;
    }
  }

  onActionClick(id: string) {
    console.log('id');
    if(id === 'delete') {
      // this.deleteApplication();
    }
  }

  setFilter(filter: IApplicationFilter) {
    this.filter = filter;
    this.updateApplicationType();
    this.getApplications();
  }

  getApplications() {
    this._applicationService.getApplications({
      ...this.filter,
      applicationTypes: this.applicationTypes,
      pageSize: this.pageSize,
      pageNum: this.pageIndex,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.loadingReports.emit(false);
          }, 600)
          if (!res) return;
          this.errorMessage = '';
          this.loading = false;
          this.pageIndex = res.number;
          this.pageSize = res.size;
          this.totalItems = res.totalElements;
          this.apps = res.content;
          this.checkForNew();
          this._cdRef.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err.message || err || 'Что-то пошло не так...';
          setTimeout(() => {
            this.loadingReports.emit(false);
          }, 600)
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  checkForNew() {
    this.hasNew = this.apps.some(app => app.applicationStatus === 'NEW');
    if(this.hasNew && !this.appSubs) {
      // this.startPolling();
    } else if(!this.hasNew && this.appSubs) {
      this.stopPolling();
    }
  }


  protected readonly tableActionBtns = tableAppsActionBtns;
}
