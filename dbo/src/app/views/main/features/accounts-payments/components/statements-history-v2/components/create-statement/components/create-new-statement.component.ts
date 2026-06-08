import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AccountService } from 'src/app/core/services/account.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { animate, style, transition, trigger } from '@angular/animations';
import { SelectDefaultComponent } from 'src/app/shared/components/select-default/select-default.component';
import { CustomCheckboxComponent } from 'src/app/shared/components/custom-checkbox/custom-checkbox.component';
import { AccountSelectorComponent } from 'src/app/shared/components/account-selector/account-selector.component';
import {Account, CreateReportReqDto} from "../create-statement.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AppReportParentDTO} from "../../../../../../../../../shared/interfaces/applications.interface";
import {ApplicationsService} from "../../../../../../applications/services/applications.service";
import {firstValueFrom, map} from "rxjs";
import {
  DatePickerDefaultComponent
} from "../../../../../../../../../shared/components/date-picker-default/date-picker-default.component";
import {DOCUMENTS_TYPES2} from "../../../../../../../../../shared/types";
import {ToastrService} from "ngx-toastr";
import {
  InputDefaultComponent
} from "../../../../../../../../../shared/components/input-default/input-default.component";
import {MatDialog} from "@angular/material/dialog";
import {
  SuccessReportDialogComponent
} from "../../../../../../../../../core/components/agree-dialog/success-report-dialog.component";
import {dateRangeValidator} from "../../../../../../../../../shared/validators/dateRangeValidator";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {
  DocumentFormatSelector2Component
} from "../../../../../../../../../shared/components/document-format-selector/document-format-selector2.component";
interface dDownDTO {
  value: string; label: string; icon?: string; hasIcon?: boolean; iconSize?: string;
}

@Component({
  selector: 'app-create-new-statement',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    SelectDefaultComponent,
    CustomCheckboxComponent,
    AccountSelectorComponent,
    DatePickerDefaultComponent,
    InputDefaultComponent,
    TranslateModule,
    DocumentFormatSelector2Component
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ],
  styleUrls: ['./../base.scss', '../../../../../../../../../style-classes/tab-class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="setting-dark-light-box">
      <div class="p-5 rounded-3xl  bg-white">
        <div class="flex items-center justify-between ">
          <h2 class="text-lg  font-semibold">{{ currentReport()?.description }}</h2>
          <button (click)="close()"
                  class="h-[30px] w-[30px] flex items-center justify-center rounded-lg hover:bg-gray-100 bg-[#EBEBEB]">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <hr class="my-5">
        @if (currentReport()) {
          <div [formGroup]="form">
            <div class="grid grid-cols-2  gap-5 mt-3">
              <div>

                <div class="flex flex-col p-5 gap-5  bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                  <p class="text-[#101010] font-semibold uppercase text-[12px]"> {{'new.account_for_statement' | translate}}</p>
                  <div>
                    <app-account-selector [accounts]="accounts()" formControlName="account"></app-account-selector>
                    <p class="text-red-500 text-xs mt-1" *ngIf="form.get('account')?.invalid && form.get('account')?.touched">
                      Поле обязательно для заполнения
                    </p>
                  </div>
                </div>

                <div class="flex flex-col p-5 gap-5  mt-5 bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                  <p class="text-[#101010] font-semibold uppercase text-[12px]">{{'accountStatements.statement_parameters' | translate}} </p>

                  <div>
                    <div>
                      <app-select-default [size]="'medium'" formControlName="reportType" [placeholder]="'Сведения о работе счёта'"
                                          [options]="currentRepList()" [required]="true" [readonly]="true"/>
                    </div>
                    <p class="text-red-500 text-xs mt-1" *ngIf="form.get('reportType')?.invalid && form.get('reportType')?.touched">
                      Поле обязательно для заполнения
                    </p>
                  </div>
                  <div>
                    <div>
                      <app-select-default [size]="'medium'" formControlName="reportFrequencyEnum" [placeholder]="'Регулярность получения'"
                                          [options]="OP_TYPES" [required]="true"/>
                    </div>
                    <p class="text-red-500 text-xs mt-1" *ngIf="form.get('reportFrequencyEnum')?.invalid && form.get('reportFrequencyEnum')?.touched">
                      Поле обязательно для заполнения
                    </p>
                  </div>
                  @if (form.get('reportFrequencyEnum')?.value === "REGULAR") {
                    <div>
                      <div>
                        <app-select-default
                          [size]="'medium'"
                          [placeholder]="'accountStatements.statement_receipt' | translate"
                          formControlName="reportRegularScheduleEnum"
                          [options]="RG_LIST"
                        />
                      </div>
                      <p class="text-red-500 text-xs mt-1" *ngIf="form.get('reportRegularScheduleEnum')?.invalid && form.get('reportRegularScheduleEnum')?.touched">
                        Поле обязательно для заполнения
                      </p>
                    </div>
                  }
                  @if (currentType() === 'BALANCES_AND_SALDO') {
                    @if (form.get('reportType')?.value === "ACCOUNT_BALANCES") {
                      <div>
                        <app-datepicker-default [mode]="'range'" formControlName="date" [minDate]="minDate()" [maxDate]="maxDate()"></app-datepicker-default>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['required']">
                          Укажите период (начало и конец)
                        </p>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['dateOrder']">
                          Дата начала не может быть позже или равно даты окончания
                        </p>
                      </div>
                    }
                    @else if (form.get('reportType')?.value === "BALANCE_SHEET") {
                      <div>
                        <app-select-default [size]="'medium'" [placeholder]="'new.include_zero_amounts' | translate"
                                            [options]="[{value: '',label: ('new.include_zero_amounts_label' | translate)}]" [required]="true"/>
                      </div>
                      <div>
                        <app-datepicker-default [mode]="'range'" formControlName="date" [minDate]="minDate()" [maxDate]="maxDate()"></app-datepicker-default>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['required']">
                          Укажите период (начало и конец)
                        </p>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['dateOrder']">
                          Дата начала не может быть позже или равно даты окончания
                        </p>
                      </div>
                    }
                  } @else {
                    <div>
                      <app-datepicker-default [mode]="'range'" formControlName="date" [minDate]="minDate()" [maxDate]="maxDate()"></app-datepicker-default>
                      <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['required']">
                        Укажите период (начало и конец)
                      </p>
                      <p class="text-red-500 text-xs mt-1" *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['dateOrder']">
                        Дата начала не может быть позже или равно даты окончания
                      </p>
                    </div>
                  }
                </div>
                @if (currentType() === 'ACCOUNT_ACTIVITIES') {
                  @if (form.get('reportType')?.value === "ACCOUNT_ACTIVITY_INFO") {
                    <div class="mt-3 flex">
                      <div class="me-5">
                        <app-custom-checkbox  [label]="'accountStatements.daily_turnover' | translate"   formControlName="dailyTurnover"></app-custom-checkbox>
                      </div>
                      <div>
                        <app-custom-checkbox  [label]="'accountStatements.include_balances' | translate"  formControlName="includeResidues"></app-custom-checkbox>
                      </div>
                    </div>
                  }
                }
              </div>
              <div>
<!--                @if (currentType() === 'STATEMENTS') {-->
<!--                  @if (form.get('reportType')?.value === "DOCUMENT_STATEMENT") {-->
<!--                    <div>2 selector</div>-->
<!--                  }-->
<!--                  @else if (form.get('reportType')?.value === "TERMINAL_STATEMENT") {-->
<!--                    <div>1 selector</div>-->
<!--                  }-->
<!--                } @else if (currentType() === 'STATEMENT_AND_CERTIFICATES') {-->
<!--                  @if (form.get('reportType')?.value === "BANK_STATEMENT_1C") {-->
<!--                    <div>1 selector</div>-->
<!--                  }-->
<!--                }-->
                <div class="flex flex-col p-5 gap-5  bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                  @if (currentType() === 'ACCOUNT_ACTIVITIES') {
                    @if (form.get('reportType')?.value === "ACCOUNT_ACTIVITY_INFO") {
                      <p class="text-[#101010] font-semibold uppercase text-[12px]">{{'accountStatements.filter_data' | translate}}</p>
                      <div>
                        <div>
                          <app-select-default [size]="'medium'" formControlName="transactionType" [placeholder]="'myAccounts.operation_type' | translate"
                                              [options]="TR_TYPES" [required]="true"/>
                        </div>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('transactionType')?.invalid && form.get('transactionType')?.touched">
                          Поле обязательно для заполнения
                        </p>
                      </div>
<!--                      <div>-->
<!--                        <app-select-default [size]="'medium'" [placeholder]="'Контрагент'"-->
<!--                                            [options]="[{value: '', label: 'Контрагент'}]" [required]="true"/>-->
<!--                      </div>-->
                    } @else if (form.get('reportType')?.value === "WITH_CORRESPONDENT") {
                      <p class="text-[#101010] font-semibold uppercase text-[12px]">{{'new.correspondent_account' | translate}}</p>
                      <div>
                        <app-input-default
                          [label]="'Счёт'"
                          formControlName="correspondentAccount"
                          type="number"
                          [maxlength]="20"
                          inputmode="numeric"
                          pattern="[0-9]*"
                        ></app-input-default>
                      </div>
                    }
                  } @else if (currentType() === 'PAYMENT_DOCUMENTS_GR') {
                    @if (form.get('reportType')?.value === "PAYMENT_DOCUMENTS") {
                      <p class="text-[#101010] font-semibold uppercase text-[12px]">{{'accountStatements.filter_data' | translate}}</p>
                      <div>
                        <div>
                          <app-select-default [size]="'medium'" formControlName="transactionType" [placeholder]="'myAccounts.operation_type' | translate"
                                              [options]="TR_TYPES" [required]="true"/>
                        </div>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('transactionType')?.invalid && form.get('transactionType')?.touched">
                          Поле обязательно для заполнения
                        </p>
                      </div>
                      <div>
                        <div>
                          <app-select-default [size]="'medium'" formControlName="currency"  [placeholder]="'new.document_currency' | translate"
                                              [options]="currList()" [required]="true"/>
                        </div>
                        <p class="text-red-500 text-xs mt-1" *ngIf="form.get('currency')?.invalid && form.get('currency')?.touched">
                          Поле обязательно для заполнения
                        </p>
                      </div>
                    }
                  }

                  <div>
                    <p class="text-14 font-medium">
                      {{'accountStatements.report_format' | translate}}
                    </p>

                    <div class="mt-5">
                      <div>
                        <app-document-format-selector2 [gap]="8" [size]="35" formControlName="reportFileType"
                                                      [formats]="docTypes()"></app-document-format-selector2>
                      </div>
                      <p class="text-red-500 text-xs mt-1" *ngIf="form.get('reportFileType')?.invalid && form.get('reportFileType')?.touched">
                        Поле обязательно для заполнения
                      </p>
                    </div>
                  </div>
<!--                  @if ( !(currentType() === 'STATEMENT_AND_CERTIFICATES' && form.get('reportType')?.value === "ACCOUNT_MOVEMENTS")) {}-->
                </div>
                <div class="mt-4">
                  <app-custom-checkbox [label]="'accountStatements.send_statement_to_email' | translate" formControlName="sendEmail"></app-custom-checkbox>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between w-full mt-6">
              <div>
              </div>
              <div>
                <button
                  class="p-[10px] rounded-xl border border-base text-white font-semibold bg-[#008C79]"
                  type="button"
                  (click)="saveAction()"
                  [disabled]="isSaving()"
                >{{ isSaving() ?
                  ('new.saving' | translate)
                  : ('accountStatements.generate_statement' | translate) }}</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})

export default class CreateNewStatementComponent {
  constructor(private applService: ApplicationsService, private toastrService: ToastrService, private _matDialog: MatDialog,   private translateService:TranslateService) { }

  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef)

  openAccount = signal<boolean>(false);
  accounts = signal<Account[]>([])
  currList = signal<dDownDTO[]>([])
  currentType = signal("");
  currentReport = signal<AppReportParentDTO | null>(null);
  currentRepList = signal<{value: string; label: string;}[]>([]);
  isSaving = signal(false);
  isUpdatingId = signal(0);
  docTypes = signal<DOCUMENTS_TYPES2[]>(['PDF', 'EXCEL']);

  today = new Date();

  minDate = signal<Date | null>(null);
  maxDate = signal<Date | null>(null);

  // public readonly list1 = [{value: "ONE_TIME", label: "Один раз"}, {value: "REGULAR", label: "Регулярно"}];
  // public readonly docTypes: DOCUMENTS_TYPES[] = ['PDF', 'EXCEL'];
  public readonly RG_LIST = [{value: "DAILY", label:  this.translateService.instant('accountStatements.daily'),}, {value: "WEEKLY", label: this.translateService.instant('accountStatements.weekly')}, {value: "MONTHLY", label: this.translateService.instant('accountStatements.monthly')}];
  public readonly OP_TYPES: {value: string; label: string;}[] = [{value: 'REGULAR', label: 'Регулярная выписка'}, {value: 'ONE_TIME', label: this.translateService.instant('accountStatements.one_time_statement')}];
  public readonly TR_TYPES: {value: string; label: string; icon?: string; hasIcon?: boolean; iconSize?: string;}[] = [
    {value: 'DEBIT_CREDIT', label: this.translateService.instant('myAccounts.all_types')},
    {value: 'DEBIT', label: this.translateService.instant('filter.outgoing'), icon: "assets/new-icons/isxodyashie.svg", hasIcon: true, iconSize: "18px"},
    {value: 'CREDIT', label: this.translateService.instant('filter.incoming'), icon: "assets/new-icons/vxodyasie.svg", hasIcon: true, iconSize: "18px"}
  ];
  // public readonly VL_TYPES: {value: string; label: string; icon: string; hasIcon: boolean; iconSize: string;}[] = [
  //   {value: 'UZS', label: 'UZS', icon: "assets/new-icons/curr_UZS.svg", hasIcon: true, iconSize: "24px"},
  //   {value: 'USD', label: 'USD', icon: "assets/new-icons/curr_USD.svg", hasIcon: true, iconSize: "24px"},
  //   {value: 'RUB', label: 'RUB', icon: "assets/new-icons/curr_RUB.svg", hasIcon: true, iconSize: "24px"}
  // ];

  form = this.fb.group({
    account: [''],
    reportType: [''],
    date: this.fb.control<{ start: Date | null; end: Date | null } | null>(null, { validators: [dateRangeValidator(true)] }),
    reportFrequencyEnum: ['ONE_TIME'],
    reportRegularScheduleEnum: [''],
    transactionType: [''],
    sendEmail: [false],
    reportFileType: ['PDF'], // CSV
    correspondentAccount: [''],
    dailyTurnover: [false],
    includeResidues: [false],
    currency: [''],
    // byMask: [false],
  });

  async ngOnInit(): Promise<void> {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (!type) {
      await this.router.navigate(['/charts/list']);
      return;
    }
    this.currentType.set(type.toUpperCase());

    let account = this.route.snapshot.queryParamMap.get('account');
    let childCat = "";
    let korresAcc = "";

    const updateId = this.route.snapshot.queryParamMap.get('updateId');
    const repeatId = this.route.snapshot.queryParamMap.get('repeatId');
    this.isUpdatingId.set(0);
    if (Number(updateId) > 0 || Number(repeatId)) {
      if (updateId) {
        this.isUpdatingId.set(Number(updateId));
      }
      const id = updateId ? updateId : repeatId;
      const resObj = await firstValueFrom(this.applService.getApplReportOne(id || ""));
      if (!resObj) {
        await this.router.navigate(['/charts/list']);
        return;
      }
      account = resObj.reportApplicationDto.account;
      childCat = resObj.reportApplicationDto.reportType;
      korresAcc = resObj.reportApplicationDto.correspondentAccount;

      this.form.patchValue({
        reportRegularScheduleEnum: resObj.reportApplicationDto.reportRegularScheduleEnum,
        reportFileType: resObj.reportApplicationDto.reportFileType,
        sendEmail: resObj.reportApplicationDto.sendEmail,
        // date: {
        //   start: resObj.reportApplicationDto.startDate ? new Date(resObj.reportApplicationDto.startDate) : null,
        //   end: resObj.reportApplicationDto.endDate ? new Date(resObj.reportApplicationDto.endDate) : null,
        // }
      });
    }
    const regular = this.route.snapshot.queryParamMap.get('regular');
    this.form.patchValue({
      reportFrequencyEnum: regular !== null ? "REGULAR" : "ONE_TIME"
    });

    this.form.get('reportFrequencyEnum')?.valueChanges.subscribe(value => {
      const scheduleControl = this.form.get('reportRegularScheduleEnum');
      const dateControl = this.form.get('date');

      dateControl?.reset();

      if (value === 'REGULAR') {
        scheduleControl?.setValidators([Validators.required]);

        this.minDate.set(this.today);
        this.maxDate.set(null);
      } else {
        scheduleControl?.clearValidators();
        scheduleControl?.setValue('');

        this.minDate.set(null);
        this.maxDate.set(this.today);
      }

      scheduleControl?.updateValueAndValidity();
      dateControl?.updateValueAndValidity();
    });

    this.getAccounts(account || "");
    this.getReports(childCat);
    this.getReferences(korresAcc);
    if (type === 'payment_documents_gr') {
      this.getCurrList('');
    }

    const initialFrequency = this.form.get('reportFrequencyEnum')?.value;

    if (initialFrequency === 'REGULAR') {
      this.minDate.set(this.today);
      this.maxDate.set(null);
    } else {
      this.minDate.set(null);
      this.maxDate.set(this.today);
    }
  }

  close() {
    this.router.navigate(['/charts/list']).then(() => "");
  }


  getCurrList(currency: string) {
    this.accountService.getManualCurrencySelectList().pipe(
      takeUntilDestroyed(this.destroyRef),
      map((res: any) => res.result && res.result.data && res.result.data.length > 0 ? res.result.data : []),
    ).subscribe((cList: any[]) => {
      const newList: dDownDTO[] = cList.map((currr: any) => ({value: currr.name, label: currr.name, icon: currr.logo.path + currr.logo.name, hasIcon: true, iconSize: '20px'}));
      this.currList.set(newList);
      if (newList.length > 0) {
        const fnd = newList.find((val) => val.value === currency);
        if (fnd) {
          this.form.patchValue({
            currency: fnd.value
          })
        }
        // else {
        //   this.form.patchValue({
        //     currency: newList[0].value
        //   })
        // }
      }
    })
  }

  getReports(childCat: string) {
    this.applService.getApplReportParent().subscribe((res) => {
      if (res && res.length > 0) {
        const fnd: AppReportParentDTO | undefined = res.find((val) => (val.enabled && val.value === this.currentType()));
        if (fnd) {
          this.currentReport.set(fnd);
          this.docTypes.set(fnd.fileTypeList);
          if (fnd.fileTypeList.length > 0) {
            this.form.patchValue({
              reportFileType: fnd.fileTypeList[0],
            });
          }
          if (fnd.child.length > 0) {
            this.currentRepList.set(fnd.child.filter((vval) => vval.enabled).map((val) => ({value: val.value, label: val.description})));
            const fmd = fnd.child.find((val) => val.value === childCat);
            if (fmd) {
              this.form.patchValue({
                reportType: fmd.value,
              })
            } else {
              this.form.patchValue({
                reportType: fnd.child[0].value,
              })
            }
          }
        } else {
          this.router.navigate(['/charts/list']);
          return;
        }
      } else {
        this.router.navigate(['/charts/list']);
        return;
      }
    });
  }

  getAccounts(account: string) {
    this.accountService.getAccountList({
      size: 500,
      page: 0
    }, {
      isReal: false,
      toAmount: null,
      accountOrderEnums: null,
      fromAmount: null,
      businessUserId: null,
      accountPrefixes: null,
      isActive: null,
      customerId: null,
      currencyEnum: null,
      withBlock: null,
      accountsNotIn: null,
      canDoOperation: null,
      currencyType: null,
      accountNumber: null,
      searchText: null,
      visible: null,
      prefixes: null,
      userId: null,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      map((res: any) => res.content || [])
    ).subscribe((accounts: any) => {
      this.accounts.set(accounts);
      if (accounts.length > 0) {
        const fnd = accounts.find((val) => val.altAcctId === account);
        if (fnd) {
          this.form.patchValue({
            account: fnd.altAcctId
          })
        }
        else {
          this.form.patchValue({
            account: accounts[0].altAcctId
          })
        }
      }
    })
  }

  // setFrequency(value: string) {
  //   this.form.patchValue({ reportFrequencyEnum: value });
  // }
  //
  // setSchedule(value: string) {
  //   this.form.patchValue({ reportRegularScheduleEnum: value });
  // }

  saveAction() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const dateControlValue = this.form.get('date')?.value as
    | { start: Date | string; end: Date | string }
    | null
    | undefined;

    let dateBegin = '';
    let dateClose = '';

    if (dateControlValue && (dateControlValue as any).start) {
      dateBegin = this.formatDate((dateControlValue as any).start);
    }
    if (dateControlValue && (dateControlValue as any).end) {
      dateClose = this.formatDate((dateControlValue as any).end);
    }
    const curAcc = this.accounts().find((val) => val.altAcctId === this.form.value.account);
    const currRep = this.currentRepList().find((val) => val.value === this.form.value.reportType);
    const body: CreateReportReqDto = {
      account: this.form.value.account!,
      date: {
        dateBegin,
        dateClose,
      },
      reportType: this.form.value.reportType!,
      reportFileType: this.form.value.reportFileType!,
      sendEmail: this.form.value.sendEmail!,
      reportFrequencyEnum: this.form.value.reportFrequencyEnum!, // "REGULAR" : "ONE_TIME",
      reportRegularScheduleEnum: this.form.value.reportFrequencyEnum === "REGULAR" ? this.form.value.reportRegularScheduleEnum! : "DAILY",
      // byMask: this.form.value.sendEmail!,
      correspondentAccount: this.form.value.reportType === "WITH_CORRESPONDENT" && this.form.value.correspondentAccount ? this.form.value.correspondentAccount.toString() : null,
      accountId: curAcc ? curAcc.id : null,
      applicationName: currRep ? currRep.label : "",
      transactionType: this.form.value.transactionType || null,
      dailyTurnover: !!this.form.value.dailyTurnover,
      includeResidues: !!this.form.value.includeResidues,
      currency: this.form.value.currency || null,
    }

    if (this.isUpdatingId() > 0) {
      this.applService.updateNewReport(this.isUpdatingId(), body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toastrService.success('Успешно обновлен!');
          this.showDetails();
        },
        error: (err) => {
          this.isSaving.set(false);
          const message = err.message || err || 'Неизвестная ошибка!';
          this.toastrService.error(message);
        }
      });
    } else {
      this.applService.createNewReport(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.toastrService.success('Успешно!');
          this.showDetails();
        },
        error: (err) => {
          this.isSaving.set(false);
          const message = err.message || err || 'Неизвестная ошибка!';
          this.toastrService.error(message);
        }
      });
    }
  }

  formatDate (date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  getReferences(acc: string) {
    const obj: { account?: string | null, search?: string | null, inn?: string | null, page: number, size: number } = {
      inn: null,
      page: 0,
      size: 100,
    };
    this.applService.getAccountReferenceList(obj).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      if (res && res.content && res.content.length > 0) {
        const fnd = res.content.find((val) => val.recipientAccountNumber === acc);
        if (fnd) {
          this.form.patchValue({
            correspondentAccount: fnd.recipientAccountNumber,
          });
        } else {
          this.form.patchValue({
            correspondentAccount: res.content[0].recipientAccountNumber,
          });
        }
      }
    });
  }

  showDetails() {
    const dialog =  this._matDialog.open(SuccessReportDialogComponent, {
      width: '504px',
    });
    dialog.afterClosed().subscribe(() => {
      this.router.navigate(['/charts/list']);
    })
  }
}
