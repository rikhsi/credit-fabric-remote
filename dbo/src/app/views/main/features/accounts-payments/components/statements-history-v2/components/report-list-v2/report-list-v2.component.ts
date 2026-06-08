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

import { CommonModule, DatePipe } from '@angular/common';

import { MatChipsModule } from '@angular/material/chips';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { MatDialog } from '@angular/material/dialog';
import { InOutPaneAnimations } from 'src/app/views/main/animations/in-out-pane.animations';
import { CustomDateAdapter } from 'src/app/core/services/custom-date-adapter.service';
import {ApplicationsService} from "../../../../../applications/services/applications.service";
import {AppReportParentDTO} from "../../../../../../../../shared/interfaces/applications.interface";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UserService} from "../../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {Reportv2Table} from "../statement-history-list/reportv2-table";
import {CreateReportV2ModalComponent} from "../create-statement-modal/create-report-v2-modal.component";
import {ActivatedRoute, Router} from "@angular/router";
import {Reportv2RegularTable} from "../statement-history-list/reportv2-regular-table";
import {TranslateModule} from "@ngx-translate/core";
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';


@Component({
  selector: 'app-report-list-v2',
  imports: [
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    CommonModule,
    PaginationComponent,
    MatTooltip,
    Reportv2Table,
    Reportv2RegularTable,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    InOutPaneAnimations
  ],
  providers: [
    DatePipe,
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
  styleUrls: ['./report-list-v2.component.scss'],
  template: `
    <div class="h-full flex flex-col gap-y-5 mr-[70px]">
      <div class="flex flex-col gap-y-5">
        <div class="text-[28px] font-bold text-[#171717]">{{ 'accountStatements.statements' | translate }}</div>
        <div>
          <div class="flex items-center justify-between mb-4">
            <!-- #region TABS -->
            <div class="flex w-fit gap-x-2 border border-transparent report-list-tab">
              @for (tab of tabs; track tab) {
                <div (click)="handleTabs(tab)" class="tab" [class.active_tab]="selectedTab()==tab.value">
                  {{ tab.title | translate }}
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
                      class=" flex items-center justify-center gap-[6px] py-[10px] px-4 rounded-xl border border-[#EBEBEB] text-[#171717] font-semibold dark:bg-[#262626] dark:border-0 bg-surface-2  transition-all ">
                <span>
                   {{ 'accountStatements.new_statement' | translate }}
                </span>
                <span class="flex items-center justify-center ">
                  <mat-icon class="!text-[#00A38D] !text-[24px] flex items-center justify-center">add</mat-icon>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      @if (selectedTab() === 'regular') {
        <div>
          <div class="p-6 bg-white rounded-[24px] min-h-[462px]">
            <app-reportv2-regular-table [dataList]="dataList2()"
                                        (deleted)="loadRegularReports()"></app-reportv2-regular-table>
          </div>
          <ng-container *ngIf="dataList2().length && totalItems2() > 5">
            <app-pagination [pageIndex]="pageIndex2()" [pageSize]="pageSize2()" [totalItems]="totalItems2()"
                            (pageChange)="pageChange($event)" (pageSizeChange)="sizeChange($event)"></app-pagination>
          </ng-container>
        </div>
      } @else {
        <div>
          <div class="p-6  rounded-[24px] min-h-[462px] bg-surface-2">
            <app-reportv2-table [dataList]="dataList()" (deleted)="loadReports()"></app-reportv2-table>
          </div>
          <ng-container *ngIf="dataList().length && totalItems() > 5">
            <app-pagination [pageIndex]="pageIndex()" [pageSize]="pageSize()" [totalItems]="totalItems()"
                            (pageChange)="pageChange($event)" (pageSizeChange)="sizeChange($event)"></app-pagination>
          </ng-container>
        </div>
      }
    </div>
  `,
  standalone: true
})
export default class ReportListV2Component implements OnInit, AfterContentInit {

  private router = inject(Router);

  constructor(public dialog: MatDialog, private applService: ApplicationsService, private route: ActivatedRoute) { }

  title = 'История'
  id = '';
  loanId = '';
  reportParentList = signal<AppReportParentDTO[]>([]);
  // reportChildList = signal<{value: string; label: string;}[]>([]);

  dataList = signal<any[]>([]);
  pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  pageIndex = signal<number>(0);
  totalItems = signal<number>(0);

  dataList2 = signal<any[]>([]);
  pageSize2 = signal<number>(DEFAULT_PAGE_SIZE);
  pageIndex2 = signal<number>(0);
  totalItems2 = signal<number>(0);

  // public statementHistoryList$$ = this.statementHistoryLogicService.statementHistoryList$$
  private destroyRef = inject(DestroyRef);
  public userService = inject(UserService);

  selectedTab = signal<string>('all');
  tabs = [
    {
      title: 'accountStatements.all',
      value: 'all',
    },
    {
      title: 'accountStatements.regular',
      value: 'regular',
    }
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const hasRegular = 'regular' in params;
      this.selectedTab.set(hasRegular ? 'regular' : 'all');

      if (hasRegular) {
        this.loadRegularReports();
      } else {
        this.loadReports();
      }
    });

    this.applService.getApplReportParentV2().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      const newList: AppReportParentDTO[] = res && res.length > 0 ? res.filter((val) => val.enabled) : [];
      this.reportParentList.set(newList);
      // const new2List: { value: string; label: string }[] = newList.flatMap(item =>
      //   item.child
      //     ?.filter(val => val.enabled)
      //     .map(child => ({
      //       value: child.value,
      //       label: child.description
      //     })) ?? []
      // );
      // this.reportChildList.set(new2List);
    });
  }

  loadRegularReports() {
    this.dataList2.set([]);
    this.applService
      .getApplReportPeriodic(this.pageIndex2(), this.pageSize2())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        console.log(res.list);
        this.dataList2.set(res.list);
        this.totalItems2.set(res.total);
      });
  }

  loadReports() {
    this.dataList.set([]);
    this.applService
      .getApplReportStatus(this.pageIndex(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.dataList.set(res.list);
        this.totalItems.set(res.total);
      });
  }

  ngAfterContentInit(): void {
  }

  pageChange(page: number) {
    if (this.selectedTab() === 'regular') {
      this.pageIndex2.set(page);
      this.loadRegularReports();
    } else {
      this.pageIndex.set(page);
      this.loadReports();
    }
  }

  sizeChange(size: number) {
    if (this.selectedTab() === 'regular') {
      this.pageSize2.set(size);
      this.pageIndex2.set(0);
      this.loadRegularReports();
    } else {
      this.pageSize.set(size);
      this.pageIndex.set(0);
      this.loadReports();
    }
  }

  openCreateStatementModal() {
    this.dialog.open(CreateReportV2ModalComponent, {
      width: '550px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: { reportParentList: this.reportParentList(), tabValue: this.selectedTab() },
    });
  }

  handleTabs(tab: any) {
    if (tab.value == 'regular') {
      this.router.navigate(['/reports/list'], {queryParams: {regular: ''}}).then(() => "");
    } else {
      this.router.navigate(['/reports/list']).then(() => "");
    }
  }
}
