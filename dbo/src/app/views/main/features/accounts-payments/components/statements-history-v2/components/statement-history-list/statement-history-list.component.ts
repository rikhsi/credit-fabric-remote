import { StatementHistoryLogicService } from '../../statement-history-logic.service';
import { NgFor, NgIf } from '@angular/common';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit} from '@angular/core';
import { FormsModule } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ACTION_ITEMS_OF_STATEMENT_HISTORY, ActionItem } from './action-items';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { ReportFrequencyEnum, ReportFrequencyEnumRu, StatmentApplicationResContent, StatusFilterRu } from '../../models/statement-history.model';
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
import {FirebaseAnalyticsService} from "../../../../../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-statement-history-list',
  imports: [FormsModule, NgFor, MatIconModule, NgIf, MatMenuModule, SvgIconComponent, NoDataComponent, MatTooltip, TranslateModule],
  styleUrls: ['./statement-history-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="w-full">
      <tbody>
        @for (statement of statementHistoryList(); track $index) {
          <tr style="border-bottom: 1px solid #ebebeb;">
            <td class="font-semibold py-5" style="min-width: 300px;">
              <div class="flex">
                <div class="flex items-center me-2">
                  <img [src]="'assets/new-icons/' + statement.reportApplicationDto.reportFileType + '.svg'" alt="" width="32" height="32" style="object-fit: contain">
                </div>
                <div>
                  <p class="text-semibold">{{statement.reportApplicationDto.applicationName}}</p>
                  <p class="text-sm text-[#A3A3A3] font-normal">
                     {{'salaryStatements.period' | translate}}: {{statement.reportApplicationDto.startDate}} - {{statement.reportApplicationDto.endDate}}
                  </p>
                  @if (statement.createdDateFormatted) {
                    <p class="text-sm text-[#A3A3A3] font-normal">
                       {{'new.created' | translate}}: {{statement.createdDateFormatted.slice(0, 16)}}
                    </p>
                  }
                </div>
              </div>
            </td>
            <td class="py-5" style="min-width: 120px;">
              <div class="flex items-center">
                <div class="h-6 w-6 p-0.5 rounded-[9px] bg-[#F7F7F7] flex justify-center items-center me-2">
                  @switch (statement.applicationStatus) {
                    @case('NEW') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/processing-status.svg" height="12" width="12" alt="">
                    }
                    @case ('COMPLETED') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/receiver-icon.svg" height="12" width="12" alt="">
                    }
                    @case ('CANCELED') {
                      <img class="object-cover h-full w-full" src="assets/new-icons/error-status.svg" height="12" width="12" alt="">
                    }
                  }
                </div>
                <div class="text-sm font-medium text-[#5C5C5C] dark:text-inherit">
                  {{StatusFilterRu[statement.applicationStatus] | translate}}
                </div>
              </div>
            </td>
            <td class="py-5" style="min-width: 100px;">
              <p class="text-sm font-medium">
                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.REGULAR) {
                  {{ReportFrequencyEnumRu.REGULAR | translate}}
                }
                @if (statement.reportApplicationDto.reportFrequencyEnum == reportFrequencyEnum.ONE_TIME) {
                  {{ ReportFrequencyEnumRu.ONE_TIME | translate}}
                }
              </p>
            </td>
            <td class="py-5">
              <div class="flex justify-end">
                <div
                  (click)="this.userService.hasAction('STATEMENTS') ? deleteApplication(statement.applicationId) : {}"
                  [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                  [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                  [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                  [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                  class="rounded-[10px] cursor-pointer h-[28px] border border-solid border-[#EBEBEB] py-[10px] px-2 text-12 flex items-center justify-center gap-2 flex-shrink-0"
                  style="min-width: 100px;">
                  <span class="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 2H10M2 4H14M12.6667 4L12.1991 11.0129C12.129 12.065 12.0939 12.5911 11.8667 12.99C11.6666 13.3412 11.3648 13.6235 11.0011 13.7998C10.588 14 10.0607 14 9.00623 14H6.99377C5.93927 14 5.41202 14 4.99889 13.7998C4.63517 13.6235 4.33339 13.3412 4.13332 12.99C3.90607 12.5911 3.871 12.065 3.80086 11.0129L3.33333 4M6.66667 7V10.3333M9.33333 7V10.3333"
                        stroke="#FB3748" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="text-xs text-[#5C5C5C] font-medium dark:text-inherit">
                      {{'salaryStatements.delete' | translate}}
                  </span>
                </div>

                <div
                  class="flex items-center justify-center flex-shrink-0 p-1 ms-3"
                  style="width: 28px; height: 28px;"
                >
                  @if (statement.reportApplicationDto.reportFrequencyEnum == 'REGULAR') {
                    <div class="text-[#00A38D] cursor-pointer"
                         [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                         [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                         [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                         [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                         (click)="this.userService.hasAction('STATEMENTS') ? updateItem(statement.reportApplicationDto?.reportTypeParent || '', statement.applicationId) : {}">
                      <img src="assets/new-icons/edit-outline.svg" class="block dark:hidden" alt="" width="18" height="18" style="object-fit: contain">
                      <img src="assets/new-icons/edit-outline-white.svg" class="hidden dark:block" alt="" width="18" height="18" style="object-fit: contain">
                    </div>
                  }
                </div>

                <div
                  class="flex items-center justify-center flex-shrink-0" style="min-width: 100px;">
                  <button
                    [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                    [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                    [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                    [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                    *ngIf="statement.reportApplicationDto.downloadUrl"
                    (click)="this.userService.hasAction('STATEMENTS') ? downloadFile(statement.reportApplicationDto.downloadUrl, statement.reportApplicationDto.applicationName, statement.reportApplicationDto.reportFileType) : {}"
                    class="flex items-center rounded-lg bg-[#00A38D] px-[10px] py-1 ms-3 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M5 0.5C2.51472 0.5 0.5 2.51472 0.5 5C0.5 7.48528 2.51472 9.5 5 9.5C7.48528 9.5 9.5 7.48528 9.5 5C9.5 2.51472 7.48528 0.5 5 0.5ZM5 2.95455C5.22593 2.95455 5.40909 3.1377 5.40909 3.36364V5.64873L6.34709 4.71073C6.50685 4.55097 6.76587 4.55097 6.92563 4.71073C7.08539 4.87049 7.08539 5.12951 6.92563 5.28927L5.28927 6.92563C5.12951 7.08539 4.87049 7.08539 4.71073 6.92563L3.07437 5.28927C2.91461 5.12951 2.91461 4.87049 3.07437 4.71073C3.23413 4.55097 3.49315 4.55097 3.65291 4.71073L4.59091 5.64873V3.36364C4.59091 3.1377 4.77407 2.95455 5 2.95455Z"
                        fill="white" />
                    </svg>
                    <span class="text-white font-semibold text-sm">
                       {{'accountStatements.download' | translate}}
                    </span>
                  </button>
                </div>

                <div class="flex-shrink-0 ms-3" style="width: 24px;">
                  @if (statement.applicationStatus === 'COMPLETED') {
                    <mat-icon
                      [matTooltip]="this.userService.hasAction('STATEMENTS') ? '' : 'У вас нет прав'"
                      [style.user-select]="this.userService.hasAction('STATEMENTS') ? '' : 'none'"
                      [style.opacity]="this.userService.hasAction('STATEMENTS') ? '1' : '0.3'"
                      [style.cursor]="this.userService.hasAction('STATEMENTS') ? 'pointer' : 'not-allowed'"
                      class="cursor-pointer" [matMenuTriggerFor]="this.userService.hasAction('STATEMENTS') ? accountMenu : null" #accountTrigger="matMenuTrigger">
                      {{ accountTrigger.menuOpen ? 'close' : 'more_vert' }}
                    </mat-icon>

                    <mat-menu #accountMenu="matMenu" xPosition="after" class="menu-actions mt-2">
                      <div *ngFor="let item of actionItems"
                        (click)="accountTrigger.closeMenu();handleAction(item, statement)"
                        class="flex items-center gap-3 p-[12px] child:text-sub-600 child:hover:text-primary-base hover:bg-gray-100 rounded-xl cursor-pointer transition text-[#5C5C5C] hover:text-black dark:text-white dark:hover:text-black">
                        <app-svg-icon [size]="18" [name]="item.icon" [class]="item.action === 'SHARE' ? 'text-[#00A38D]' : 'text-[#5C5C5C]'"></app-svg-icon>
                        <div class="flex flex-col leading-4">
                          <h3 class="text-[14px] font-medium">
                            {{item.title | translate}}
                          </h3>
                        </div>
                      </div>
                    </mat-menu>
                  }
                </div>
              </div>
            </td>
          </tr>
        }
        @empty {
          <tr>
            <td class="py-5" colspan="4">
              <app-no-data></app-no-data>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class StatementHistoryListComponent implements OnInit {
  private router = inject(Router);
  public userService = inject(UserService)
  statementHistoryList = input<StatmentApplicationResContent[]>([])


  readonly actionItems = ACTION_ITEMS_OF_STATEMENT_HISTORY
  readonly ReportFrequencyEnumRu = ReportFrequencyEnumRu
  readonly reportFrequencyEnum = ReportFrequencyEnum
  readonly StatusFilterRu = StatusFilterRu


  selectedRows: any[] = [];

  constructor(
    private statementHistoryLogicService: StatementHistoryLogicService,
    private applicationService: ApplicationsService,
    private matDialog: MatDialog,
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    private translateService:TranslateService,
    private analyticsService: FirebaseAnalyticsService

  ) {
  }

  ngOnInit(): void {
  }



  deleteApplication(id: number) {
    this.matDialog.open(DeleteModalComponent, {
      data: {
        title:  this.translateService.instant('new.are_you_sure_you_want_to_delete_applications'),
        agree: this.translateService.instant('accounts.yes'),
        cancel: this.translateService.instant('templates.no'),
      }
    }).afterClosed()
      .subscribe({
        next: (res: any) => {
          if (res === 'agree') {
            this.deleteSelectedRows([id.toString()]);
          }
        }
      })
  }



  downloadFile(url: string, name: string, type: string) {

    fetch(url).then(res => res.blob()).then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      let newType = type.toLowerCase();
      if (newType === 'excel') {
        newType = 'xlsx';
      } else if (newType === 'word') {
        newType = 'docx';
      }

      this.analyticsService.logFirebaseCustomEvent('cards_download_bank_statement_success', {bank_statement_format: newType});

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${name}.${newType}`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      this.toastrService.success('Загружено успешно!');
    })
    .catch(() => {
      this.toastrService.error('Ошибка при загрузке');
    });
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = name;
    // link.target = '_blank';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // this.toastrService.success('Загружено успешно!')
  }

  deleteSelectedRows(ids: string[]) {
    this.applicationService.deleteApplications(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastrService.success(this.translateService?.instant('new.successfully_deleted'), this.translateService?.instant('settings.success'));
          this.statementHistoryLogicService.refreshTrigger$$.next()
          this._cdRef.markForCheck();
        },
        error: (err) => {
          const errorMessage = (err.message || err || 'Что-то пошло не так!') as string;
          this.toastrService.error(errorMessage);
        }
      })
  }

  handleAction(action: ActionItem, item: any) {
    console.log(item);
    switch (action.action) {
      case 'DELETE':
        this.deleteApplication(item.applicationId);
        break;
      case 'REFRESH':
        this.repeatItem(item.reportApplicationDto?.reportTypeParent || '', item.applicationId);
        break;
      case 'SHARE':
        this.share(item);
        break;
      case 'SHARE_EMAIL':
        this.shareByEmail(item);
        break;
    }
  }

  repeatItem(type: string, repeatId: string | number) {
    if (type) {
      this.router.navigate(['/charts/create-statement'], {queryParams: {type: type.toLowerCase(), repeatId}});
    }
  }

  updateItem(type: string, updateId: number | string) {
    if (type) {
      this.router.navigate(['/charts/create-statement'], {queryParams: {type: type.toLowerCase(), updateId}});
    }
  }

  shareByEmail(data) {
    const subject = encodeURIComponent('Реквизиты счёта');
    const body = encodeURIComponent(`
    ${data?.reportApplicationDto?.applicationName}
      Номер счёта: ${data?.reportApplicationDto?.account}

      Период: ${data?.reportApplicationDto?.startDate} - ${data?.reportApplicationDto?.endDate}
      Статус: ${data.applicationStatus}
      Скачать: ${data?.reportApplicationDto?.downloadUrl}
    `);

    const recipient = 'bankuz@mail.ru';

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }

  share(data) {
    const textToShare = `
      ${data?.reportApplicationDto?.applicationName}

      Номер счёта: ${data?.reportApplicationDto?.account}
      Период: ${data?.reportApplicationDto?.startDate} - ${data?.reportApplicationDto?.endDate}
      Статус: ${data.applicationStatus}
      Скачать: ${data?.reportApplicationDto?.downloadUrl}
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
