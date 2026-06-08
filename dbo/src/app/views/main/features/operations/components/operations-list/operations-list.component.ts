import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { operationsQuickActions } from '../../constants/quick-action-btns';
import { ChildrenOutletContexts, Router } from '@angular/router';
import { ApplicationsService } from '../../../applications/services/applications.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdditionalInfoComponent } from '../../../../../../shared/components/additional-info/additional-info.component';
import {
  OperationApplicationComponent
} from '../../../../../../shared/components/operation-application/operation-application.component';
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { QuickActionsComponent } from '../../../main/components/quick-actions/quick-actions.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-operations-list',
    imports: [
        AdditionalInfoComponent,
        OperationApplicationComponent,
        PaginatorComponent,
        QuickActionsComponent,
        NgClass
    ],
    templateUrl: './operations-list.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsListComponent implements OnInit {
  types = ['SWIFT', 'CONVERSION_CROSS', 'CONVERSION_SELL', 'CONVERSION_BUY'];
  actions = operationsQuickActions;
  errorMessage = '';
  loading = false;
  applications: any[] = [];
  pageIndex = 0;
  pageSize = 20;
  totalElements = 0;

  constructor(
    private _contexts: ChildrenOutletContexts,
    private router: Router,
    private applicationService: ApplicationsService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {}
  protected get routeAnimationData(): string {
    return this._contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
      ];
  }

  ngOnInit() {
    this.getApplications();
  }

  getApplications() {
    this.loading = true;
    this.applicationService.getApplications({
      applicationTypes: ['SWIFT', 'CONVERSION_CROSS', 'CONVERSION_BUY', 'CONVERSION_SELL'],
      pageSize: this.pageSize,
      pageNum: this.pageIndex,
      sender: null,
      receiver: null,
      dateFrom: null,
      dateTo: null,
      amountFrom: null,
      amountTo: null,
      docNum: null,
      currency: null,
      searchText: '',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.pageIndex = res.number;
            this.pageSize = res.size;
            this.totalElements = res.totalElements;
            this.applications = res.content;
            this.errorMessage = '';
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

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getApplications();
  }
}
