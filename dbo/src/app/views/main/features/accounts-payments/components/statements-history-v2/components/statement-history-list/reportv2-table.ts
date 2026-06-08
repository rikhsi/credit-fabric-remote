import { StatementHistoryLogicService } from '../../statement-history-logic.service';
import { NgFor, NgIf } from '@angular/common';
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
import { ACTION_ITEMS_OF_STATEMENT_HISTORY, ActionItem } from './action-items';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import {ReportFrequencyEnum, ReportFrequencyEnumRu, ReportV2ListDTO,} from '../../models/statement-history.model';
import { ApplicationsService } from 'src/app/views/main/features/applications/services/applications.service';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { NoDataComponent } from 'src/app/shared/components/no-data/no-data.component';
import {Router} from "@angular/router";
import {UserService} from "../../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import {environment} from "../../../../../../../../../environments/environment";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-reportv2-table',
  imports: [FormsModule, NgFor, MatIconModule, NgIf, MatMenuModule, SvgIconComponent, NoDataComponent, MatTooltip, TranslateModule],
  styleUrls: ['./statement-history-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="w-full">
      <tbody>
        @for (statement of dataList(); track $index) {
          <tr>
            <td class="font-semibold py-5" style="min-width: 300px;">
              <div class="flex">
                <div class="flex items-center me-4">
                  <mat-icon [svgIcon]="'hamkor_' + statement.format"
                            [style]="{color: '#008077', height: '32px', width: '32px'}"></mat-icon>
                </div>
                <div>
                  <p class="text-semibold">{{ statement.template_name }}</p>
                  <p class="text-sm text-[#A3A3A3] font-normal">
                    @if (statement.parameters.date_from) {
                      {{ 'accounts.period' | translate }}: {{ formatDate(statement.parameters.date_from) }}&nbsp;-&nbsp;{{ formatDate(statement.parameters.date_to) }}
                    }
                    @if (statement.parameters.date) {
                      {{ 'myAccounts.date' | translate }}: {{ formatDate(statement.parameters.date) }}
                    }
                  </p>
                </div>
              </div>
            </td>
            <td class="py-5" style="min-width: 120px;">
              <div class="flex items-center">
                <div class="h-6 w-6 p-0.5 rounded-[9px] bg-[#F7F7F7] flex justify-center items-center me-2">
                  @switch (statement.status) {
                    @case ('pending') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/processing-status.svg" height="12"
                           width="12" alt="">
                    }
                    @case ('done') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/receiver-icon.svg" height="12"
                           width="12" alt="">
                    }
                    @case ('error') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/error-status.svg" height="12"
                           width="12" alt="">
                    }
                    @case ('no_data') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/error-status.svg" height="12"
                           width="12" alt="">
                    }
                  }
                </div>
                <div class="text-sm font-medium text-[#5C5C5C] dark:text-inherit">
                  {{ StatusFilterRu[statement.status] | translate }}
                </div>
              </div>
            </td>
            <!--            <td class="py-5" style="min-width: 100px;">-->
            <!--              <p class="text-sm font-medium">-->
            <!--                &lt;!&ndash;                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.REGULAR) {&ndash;&gt;-->
            <!--                &lt;!&ndash;                  {{ReportFrequencyEnumRu.REGULAR}}&ndash;&gt;-->
            <!--                &lt;!&ndash;                }&ndash;&gt;-->
            <!--                &lt;!&ndash;                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.ONE_TIME) {&ndash;&gt;-->
            <!--                &lt;!&ndash;                  {{ ReportFrequencyEnumRu.ONE_TIME}}&ndash;&gt;-->
            <!--                &lt;!&ndash;                }&ndash;&gt;-->
            <!--                {{ ReportFrequencyEnumRu.ONE_TIME | translate }}-->
            <!--              </p>-->
            <!--            </td>-->
            <td class="py-5">
              <div class="flex justify-end">
                <!--                <div-->
                <!--                  (click)="this.userService.hasAction('STATEMENTS') ? deleteApplication(statement.id) : {}"-->
                <!--                  [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"-->
                <!--                  [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"-->
                <!--                  [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"-->
                <!--                  [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"-->
                <!--                  class="rounded-[10px] cursor-pointer h-[28px] border border-solid border-[#EBEBEB] py-[10px] px-2 text-12 flex items-center justify-center gap-2 flex-shrink-0"-->
                <!--                  style="min-width: 100px;">-->
                <!--                  <span class="flex items-center justify-center">-->
                <!--                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">-->
                <!--                      <path-->
                <!--                        d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.871 12.065 3.80086 11.0129L3.33333 4M6.66667 7V10.3333M9.33333 7V10.3333"-->
                <!--                        stroke="#FB3748" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>-->
                <!--                    </svg>-->
                <!--                  </span>-->
                <!--                  <span class="text-xs text-[#5C5C5C] font-medium dark:text-inherit">-->
                <!--                    {{ 'accountStatements.delete' | translate }}-->
                <!--                  </span>-->
                <!--                </div>-->

                <!--                <div-->
                <!--                  class="flex items-center justify-center flex-shrink-0 p-1 ms-3 cursor-pointer"-->
                <!--                  style="width: 28px; height: 28px;"-->
                <!--                >-->
                <!--                  @if (statement.reportApplicationDto.reportFrequencyEnum == 'REGULAR') {-->
                <!--                    <div class="text-[#00A38D]"-->
                <!--                         [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"-->
                <!--                         [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"-->
                <!--                         [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"-->
                <!--                         [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"-->
                <!--                         (click)="this.userService.hasAction('STATEMENTS') ? updateItem(statement.reportApplicationDto?.reportTypeParent || '', statement.applicationId) : {}">-->
                <!--                      <img src="assets/new-icons/edit-outline.svg" class="" alt="" width="18" height="18" style="object-fit: contain">-->
                <!--                    </div>-->
                <!--                  }-->
                <!--                </div>-->

                <div
                  class="flex items-center justify-center flex-shrink-0" style="min-width: 134px;">
                  <button
                    [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                    [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                    [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                    [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                    *ngIf="statement.id && statement.status === 'done'"
                    (click)="this.userService.hasAction('STATEMENTS') ? downloadFile(statement.id, statement.template_name, statement.format) : {}"
                    class="flex items-center rounded-lg bg-[#00A38D] px-[10px] py-1 ms-3 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M5 0.5C2.51472 0.5 0.5 2.51472 0.5 5C0.5 7.48528 2.51472 9.5 5 9.5C7.48528 9.5 9.5 7.48528 9.5 5C9.5 2.51472 7.48528 0.5 5 0.5ZM5 2.95455C5.22593 2.95455 5.40909 3.1377 5.40909 3.36364V5.64873L6.34709 4.71073C6.50685 4.55097 6.76587 4.55097 6.92563 4.71073C7.08539 4.87049 7.08539 5.12951 6.92563 5.28927L5.28927 6.92563C5.12951 7.08539 4.87049 7.08539 4.71073 6.92563L3.07437 5.28927C2.91461 5.12951 2.91461 4.87049 3.07437 4.71073C3.23413 4.55097 3.49315 4.55097 3.65291 4.71073L4.59091 5.64873V3.36364C4.59091 3.1377 4.77407 2.95455 5 2.95455Z"
                            fill="white"/>
                    </svg>
                    <span class="text-white font-semibold text-sm">
                      {{ 'accountStatements.download' | translate }}
                    </span>
                  </button>
                </div>

                <div class="flex-shrink-0 ms-3" style="width: 24px;">
                  @if (statement.status === 'done') {
                    <mat-icon
                      [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                      [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                      [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                      [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                      class="cursor-pointer"
                      [matMenuTriggerFor]="this.userService.hasAction('STATEMENTS') ? accountMenu : null"
                      class="min-h-7 min-w-7 flex items-center justify-center"
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
                </div>
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
export class Reportv2Table implements OnInit {
  private API_URL = `${environment.API_BASE}`;
  private router = inject(Router);
  public userService = inject(UserService);

  dataList = input<ReportV2ListDTO[]>([]);
  @Output() deleted = new EventEmitter<void>();


  readonly actionItems = ACTION_ITEMS_OF_STATEMENT_HISTORY
  readonly ReportFrequencyEnumRu = ReportFrequencyEnumRu
  readonly reportFrequencyEnum = ReportFrequencyEnum
  readonly StatusFilterRu = {
    pending: "accountStatements.inProgress",
    done: "accountStatements.readyForDownload",
    error: "accountStatements.errorDuringGeneration",
    no_data: "accountStatements.noData"
  };


  selectedRows: any[] = [];

  constructor(
    private statementHistoryLogicService: StatementHistoryLogicService,
    private applicationService: ApplicationsService,
    private matDialog: MatDialog,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private translate: TranslateService,
    private analyticsService: FirebaseAnalyticsService
  ) {
  }

  ngOnInit(): void {
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }



  deleteApplication(id: string) {
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
            this.deleteSelectedRows([id]);
          }
        }
      })
  }



  downloadFile(id: string, name: string, format: string) {
    let newFormat = format;
    if (format === 'excel') {
      newFormat = 'xlsx';
    } else if (format === 'word') {
      newFormat = 'docx';
    }

    this.analyticsService.logFirebaseCustomEvent('cards_download_bank_statement_success', { bank_statement_format: newFormat });

    this.applicationService.downloadReportAPI(id).subscribe(blob => {
      if (blob) {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.${newFormat}`;
        a.click();

        window.URL.revokeObjectURL(url);
      } else {
        this.toastrService.error("Произошла ошибка. Повторите попытку позже.");
      }
    });
  }

  deleteSelectedRows(ids: string[]) {
    this.applicationService.deleteReportV2(ids)
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

  handleAction(action: ActionItem, item: ReportV2ListDTO) {
    switch (action.action) {
      case 'DELETE':
        this.deleteApplication(item.id);
        break;
      case 'REFRESH':
        this.repeatItem(item.template_id, item.parameters, item.format);
        break;
      case 'SHARE':
        this.share(item);
        break;
      case 'SHARE_EMAIL':
        this.shareByEmail(item);
        break;
    }
  }

  repeatItem(template_id: string, params: any, format: string) {
    if (template_id) {
      this.router.navigate(['/reports/create'], {queryParams: {template_id, format, params: JSON.stringify(params)}});
    }
  }

  // updateItem(type: string, updateId: number | string) {
  //   if (type) {
  //     this.router.navigate(['/charts/create-statement'], {queryParams: {type: type.toLowerCase(), updateId}});
  //   }
  // }

  shareByEmail(data: ReportV2ListDTO) {
    const subject = encodeURIComponent('Реквизиты счёта');
    const body = encodeURIComponent(`
    ${data.template_name}
      Номер счёта: ${data.id}

      Период: ${data.parameters.date_from} - ${data.parameters.date_to}
      Статус: ${this.StatusFilterRu[data.status]}
      Скачать: ${this.API_URL}/api/reports/v1/download/${data.id}
    `);

    const recipient = 'bankuz@mail.ru';

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }

  share(data: ReportV2ListDTO) {
    const textToShare = `
      ${data.template_name}

      Номер счёта: ${data.id}
      Период: ${data.parameters.date_from} - ${data.parameters.date_to}
      Статус: ${this.StatusFilterRu[data.status]}
      Скачать: ${this.API_URL}/api/reports/v1/download/${data.id}
    `;
    if (navigator.share) {
      navigator.share({
        title: 'Реквизиты счёта',
        text: textToShare
      }).then(() => {
        console.log("✅ Поделились");
      }).catch(err => {
        console.error("❌ Ошибка:", err);
      });
    } else {
      console.log("❌ Web Share API не поддерживается");
    }
  }

}
