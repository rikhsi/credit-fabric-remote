import { StatementHistoryLogicService } from '../../statement-history-logic.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  OnInit, Output
} from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import {ReportFrequencyEnum, ReportFrequencyEnumRu, ReportV2RegularDTO} from '../../models/statement-history.model';
import { ApplicationsService } from 'src/app/views/main/features/applications/services/applications.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { NoDataComponent } from 'src/app/shared/components/no-data/no-data.component';
import {Router} from "@angular/router";
import {UserService} from "../../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {TranslateModule, TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-reportv2-regular-table',
  imports: [FormsModule, MatIconModule, MatMenuModule, NoDataComponent, MatTooltip, TranslateModule],
  styleUrls: ['./statement-history-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="w-full">
      <tbody>
        @for (statement of dataList(); track $index) {
          <tr>
            <td class="font-semibold py-5" style="min-width: 300px;max-width: 800px;">
              <div class="flex">
                <div class="flex items-center me-4">
                  <mat-icon [svgIcon]="'hamkor_' + statement.format"
                            [style]="{color: '#008077', height: '32px', width: '32px'}"></mat-icon>
                </div>
                <div>
                  <p class="text-semibold">{{ statement.template_name }}</p>
                  <p class="text-sm text-[#A3A3A3] font-normal">
                    {{ 'accountStatements.' + statement.schedule.frequency | translate }}
                    <!--                    @if (statement.parameters.date_from) {-->
                    <!--                      Период: {{statement.parameters.date_from}}&nbsp;&nbsp;{{statement.parameters.date_to}}-->
                    <!--                    }-->
                    <!--                    @if (statement.parameters.date) {-->
                    <!--                      Дата: {{statement.parameters.date}}-->
                    <!--                    }-->
                  </p>
                </div>
              </div>
            </td>
            <!--            <td class="py-5" style="min-width: 120px;">-->
            <!--              <div class="flex items-center">-->
            <!--                <div class="h-6 w-6 p-0.5 rounded-[9px] bg-[#F7F7F7] flex justify-center items-center me-2">-->
            <!--                  @switch (statement.enabled) {-->
            <!--                    @case (true) {-->
            <!--                      <img class="object-cover h-full w-full" src="assets/new-icons/receiver-icon.svg" height="12"-->
            <!--                           width="12" alt="">-->
            <!--                    }-->
            <!--                    @case (false) {-->
            <!--                      <img class="object-cover h-full w-full" src="assets/new-icons/error-status.svg" height="12"-->
            <!--                           width="12" alt="">-->
            <!--                    }-->
            <!--                  }-->
            <!--                </div>-->
            <!--                &lt;!&ndash;                <div class="text-sm font-medium text-[#5C5C5C]">&ndash;&gt;-->
            <!--                &lt;!&ndash;                  {{StatusFilterRu[statement.status]}}&ndash;&gt;-->
            <!--                &lt;!&ndash;                </div>&ndash;&gt;-->
            <!--              </div>-->
            <!--            </td>-->
            <td class="py-5" style="min-width: 120px;">
              <p class="text-sm font-medium">
                <!--                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.REGULAR) {-->
                <!--                  {{ReportFrequencyEnumRu.REGULAR}}-->
                <!--                }-->
                <!--                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.ONE_TIME) {-->
                <!--                  {{ ReportFrequencyEnumRu.ONE_TIME}}-->
                <!--                }-->
                {{ ReportFrequencyEnumRu.REGULAR | translate }}
              </p>
              <p class="text-[#A3A3A3] text-sm">
                {{ 'accountStatements.statement_receipt' | translate }}
              </p>
            </td>
            <td class="py-5">
              <div class="flex justify-end">
                <div
                  (click)="this.userService.hasAction('STATEMENTS') ? deleteApplication(statement.id) : {}"
                  [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                  [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                  [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                  [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                  class="rounded-[10px] cursor-pointer h-[28px] border border-solid border-[#EBEBEB] py-[10px] px-2 text-12 flex items-center justify-center gap-2 flex-shrink-0"
                  style="min-width: 100px;">
                                  <span class="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"
                                         fill="none">
                                      <path
                                        d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.871 12.065 3.80086 11.0129L3.33333 4M6.66667 7V10.3333M9.33333 7V10.3333"
                                        stroke="#FB3748" stroke-width="1.5" stroke-linecap="round"
                                        stroke-linejoin="round"/>
                                    </svg>
                                  </span>
                  <span class="text-xs text-[#5C5C5C] font-medium dark:text-inherit">
                                    {{ 'accountStatements.delete' | translate }}
                                  </span>
                </div>

                <div
                  class="flex items-center justify-center flex-shrink-0 p-1 ms-5"
                  style="width: 28px; height: 28px;"
                >
                  <div class="text-[#00A38D] cursor-pointe"
                       [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                       [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                       [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                       [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                       (click)="this.userService.hasAction('STATEMENTS') ? updateItem(statement) : {}">
                    <img src="assets/new-icons/edit-outline.svg" class="block dark:hidden" alt="" width="18" height="18"
                         style="object-fit: contain">
                    <img src="assets/new-icons/edit-outline-white.svg" class="hidden dark:block" alt="" width="18"
                         height="18" style="object-fit: contain">
                  </div>
                </div>

                <!--<div class="flex-shrink-0 ms-3" style="width: 24px;">
                  @if (statement.enabled) {
                    <mat-icon
                      [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                      [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                      [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                      [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                      class="cursor-pointer"
                      [matMenuTriggerFor]="this.userService.hasAction('STATEMENTS') ? accountMenu : null"
                      #accountTrigger="matMenuTrigger">
                      {{ accountTrigger.menuOpen ? 'close' : 'more_vert' }}
                    </mat-icon>

                    <mat-menu #accountMenu="matMenu" xPosition="after" class="menu-actions mt-2">
                      <div *ngFor="let item of actionItems"
                           (click)="accountTrigger.closeMenu();handleAction(item, statement)"
                           class="flex items-center gap-3 p-[12px] child:text-sub-600 child:hover:text-primary-base hover:bg-gray-100 rounded-xl cursor-pointer transition text-[#5C5C5C] hover:text-black dark:text-white dark:hover:text-black">
                        <app-svg-icon [size]="18" [name]="item.icon"
                                      [class]="item.action === 'SHARE' ? 'text-[#00A38D]' : 'text-[#5C5C5C]'"></app-svg-icon>
                        <div class="flex flex-col leading-4">
                          <h3 class="text-[14px] font-medium">
                            {{ item.title | translate }}
                          </h3>
                        </div>
                      </div>
                    </mat-menu>
                  }
                </div>-->
              </div>
            </td>
          </tr>
        } @empty {
          <tr>
            <td class="py-5" colspan="4">
              <app-no-data></app-no-data>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
  standalone: true
})
export class Reportv2RegularTable implements OnInit {
  // private API_URL = `${environment.API_BASE}`;
  private router = inject(Router);
  public userService = inject(UserService);

  dataList = input<ReportV2RegularDTO[]>([]);
  @Output() deleted = new EventEmitter<void>();


  // readonly actionItems = ACTION_ITEMS_OF_STATEMENT_HISTORY
  readonly ReportFrequencyEnumRu = ReportFrequencyEnumRu
  readonly reportFrequencyEnum = ReportFrequencyEnum


  selectedRows: any[] = [];

  constructor(
    private statementHistoryLogicService: StatementHistoryLogicService,
    private applicationService: ApplicationsService,
    private matDialog: MatDialog,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
  }



  deleteApplication(periodic_report_id: string) {
    this.matDialog.open(DeleteModalComponent, {
      data: {
        title: 'new.are_you_sure_you_want_to_delete_applications',
        agree: 'accounts.yes',
        cancel: 'templates.no',
      }
    }).afterClosed()
      .subscribe({
        next: (res: any) => {
          if (res === 'agree') {
            this.deleteSelectedRows(periodic_report_id);
          }
        }
      })
  }

  deleteSelectedRows(periodic_report_id: string) {
    this.applicationService.deleteReportRegularV2(periodic_report_id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastrService.success(this.translate?.instant('new.successfully_deleted'), this.translate?.instant('settings.success'));
          this.deleted.emit();
          this.statementHistoryLogicService.refreshTrigger$$.next()
          this._cdRef.markForCheck();
        },
        error: (err) => {
          const errorMessage = (err.message || err || 'Что-то пошло не так!') as string;
          this.toastrService.error(errorMessage);
        }
      })
  }

  // handleAction(action: ActionItem, item: ReportV2RegularDTO) {
  //   switch (action.action) {
  //     case 'DELETE':
  //       this.deleteApplication(item.id);
  //       break;
  //     case 'REFRESH':
  //       this.repeatItem(item.template_id, item.constant_parameters, item.format);
  //       break;
  //     case 'SHARE':
  //       this.share(item);
  //       break;
  //     case 'SHARE_EMAIL':
  //       this.shareByEmail(item);
  //       break;
  //   }
  // }

  // repeatItem(template_id: string, params: any, format: string) {
  //   if (template_id) {
  //     this.router.navigate(['/reports/create'], {queryParams: {template_id, format, regular: 'true', params: JSON.stringify(params)}});
  //   }
  // }

  updateItem(report: ReportV2RegularDTO) {
    this.router.navigate(['/reports/create'], {queryParams: {updateId: report.id, template_id: report.template_id, format: report.format, regular: 'true', frequency: report.schedule.frequency, params: JSON.stringify(report.constant_parameters)}});
  }

  // shareByEmail(data: ReportV2RegularDTO) {
  //   const subject = encodeURIComponent('Реквизиты счёта');
  //   const body = encodeURIComponent(`
  //   ${data.template_name}
  //     Номер счёта: ${data.id}
  //
  //     Скачать: ${this.API_URL}/api/reports/v1/download/${data.id}
  //   `);
  //   // Период: ${data.parameters.date_from} - ${data.parameters.date_to}
  //   // Статус: ${this.StatusFilterRu[data.status]}
  //
  //   const recipient = 'bankuz@mail.ru';
  //
  //   window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  // }

  // share(data: ReportV2RegularDTO) {
  //   const textToShare = `
  //     ${data.template_name}
  //
  //     Номер счёта: ${data.id}
  //     Скачать: ${this.API_URL}/api/reports/v1/download/${data.id}
  //   `;
  //   // Период: ${data.parameters.date_from} - ${data.parameters.date_to}
  //   // Статус: ${this.StatusFilterRu[data.status]}
  //   if (navigator.share) {
  //     navigator.share({
  //       title: 'Реквизиты счёта',
  //       text: textToShare
  //     }).then(() => {
  //       console.log("✅ Поделились");
  //     }).catch(err => {
  //       console.error("❌ Ошибка:", err);
  //     });
  //   } else {
  //     console.log("❌ Web Share API не поддерживается");
  //   }
  // }

}
