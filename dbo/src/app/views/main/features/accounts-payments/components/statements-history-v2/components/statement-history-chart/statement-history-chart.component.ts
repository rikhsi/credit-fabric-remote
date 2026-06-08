import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component, DestroyRef, inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';

import { MatChipsModule } from '@angular/material/chips';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MatDialog } from '@angular/material/dialog';
import { StatementHistoryFiltersComponent } from '../statement-history-filters/statement-history-filters.component';
import { StatementHistoryListComponent } from '../statement-history-list/statement-history-list.component';
import { InOutPaneAnimations } from 'src/app/views/main/animations/in-out-pane.animations';
import { CustomDateAdapter } from 'src/app/core/services/custom-date-adapter.service';
import { StatementHistoryLogicService } from '../../statement-history-logic.service';
import { CreateStatementModalComponent } from '../create-statement-modal/create-statement-modal.component';
import {ApplicationsService} from "../../../../../applications/services/applications.service";
import {AppReportParentDTO} from "../../../../../../../../shared/interfaces/applications.interface";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UserService} from "../../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TranslateModule, TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-statement-history-chart',
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    CommonModule,
    StatementHistoryFiltersComponent,
    StatementHistoryListComponent,
    PaginationComponent,
    AsyncPipe,
    MatTooltip,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    InOutPaneAnimations
  ],
  providers: [
    DatePipe,
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  styleUrls: ['./statement-history-chart.component.scss'],
  template: `
    <div class="h-full flex flex-col gap-y-5 setting-dark-light-box">
      <div class="flex flex-col gap-y-5">
        <div class="text-[28px] font-bold text-[#171717]"> {{'accountStatements.statements' | translate}}</div>
        <div>
          <div class="flex items-center justify-between mb-4">
            <!-- #region TABS -->
            <div class="flex w-fit gap-x-2 border border-transparent ">
              @for (tab of tabs; track tab) {
              <div (click)="handleTabs(tab)" class="tab" [class.active_tab]="selectedTab()==tab.value">
                {{
                tab?.title }}
              </div>
              }
            </div>
            <!-- #endregion TABS -->
            <div>
              <button (click)="this.userService.hasAction('STATEMENTS') ? openCreateStatementModal() : {}"
                      [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                      [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                      [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                      [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                class="flex items-center justify-center gap-[6px] py-[10px] px-4 rounded-xl border border-[#EBEBEB] text-[#171717] font-semibold bg-white hover:bg-[#F4F7FB] transition-all">
                <span>
                   {{'accountStatements.new_statement' | translate}}
                </span>
                <span class="flex items-center justify-center ">
                  <mat-icon class="!text-[#00A38D] !text-[24px] flex items-center justify-center">add</mat-icon>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="p-6 bg-white rounded-xl">
        <!-- <app-filter-payment></app-filter-payment> -->
        <app-statement-history-filters [reportChildList]="reportChildList()"></app-statement-history-filters>
        <app-statement-history-list
          [statementHistoryList]="(statementHistoryList$$ | async) || []"></app-statement-history-list>
      </div>
      <ng-container *ngIf="(statementHistoryList$$ | async) as statementHistoryList">
        @if (statementHistoryList.length > 0) {
        <app-pagination [pageIndex]="pageIndex()" [pageSize]="pageSize()" [totalItems]="totalItems()"
          (pageChange)="pageChange($event)" (pageSizeChange)="sizeChange($event)"></app-pagination>
        }
      </ng-container>
    </div>
  `,
})
export default class StatementHistoryChartComponent implements OnInit, AfterContentInit {

  constructor(
    public dialog: MatDialog,
    private statementHistoryLogicService: StatementHistoryLogicService,
    private applService: ApplicationsService,
    private translateService: TranslateService,
  ) { }

  title = 'История'
  id = '';
  loanId = '';
  reportParentList = signal<AppReportParentDTO[]>([]);
  reportChildList = signal<{value: string; label: string;}[]>([]);

  public statementHistoryList$$ = this.statementHistoryLogicService.statementHistoryList$$
  private destroyRef = inject(DestroyRef);
  public userService = inject(UserService);
  pageIndex = this.statementHistoryLogicService.pageIndex
  pageSize = this.statementHistoryLogicService.pageSize
  totalItems = this.statementHistoryLogicService.totalItems

  selectedTab = signal<string>('all');
  tabs = [
    {
      title: this.translateService.instant('accountStatements.all'),
      value: 'all',
    },
    {
      title:  this.translateService.instant('accountStatements.regular'),
      value: 'regular',
    }
  ];

  ngOnInit(): void {
    this.statementHistoryLogicService.reportFrequencyEnum.set('');
    this.statementHistoryLogicService.getAllApplication().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.statementHistoryLogicService.refreshTrigger$$.next();

    this.applService.getApplReportParent().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      const newList: AppReportParentDTO[] = res && res.length > 0 ? res.filter((val) => val.enabled) : [];
      this.reportParentList.set(newList);
      const new2List: { value: string; label: string }[] = newList.flatMap(item =>
        item.child
          ?.filter(val => val.enabled)
          .map(child => ({
            value: child.value,
            label: child.description
          })) ?? []
      );
      this.reportChildList.set(new2List);
    });
  }

  ngAfterContentInit(): void {
  }

  pageChange(page: number) {
    this.statementHistoryLogicService.pageChange(page)
  }

  sizeChange(size: number) {
    this.statementHistoryLogicService.sizeChange(size)
  }

  openCreateStatementModal() {
    this.dialog.open(CreateStatementModalComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: { reportParentList: this.reportParentList(), tabValue: this.selectedTab() },
    });
  }

  handleTabs(tab: any) {
    this.selectedTab.set(tab.value)
    if (tab.value == 'regular') {
      this.statementHistoryLogicService.reportFrequencyEnum.set('REGULAR')
    } else {
      this.statementHistoryLogicService.reportFrequencyEnum.set('')
    }
    this.statementHistoryLogicService.refreshTrigger$$.next()
  }
}
