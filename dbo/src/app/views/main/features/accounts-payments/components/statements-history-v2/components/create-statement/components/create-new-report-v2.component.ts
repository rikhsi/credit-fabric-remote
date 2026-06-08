import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {animate, style, transition, trigger} from '@angular/animations';
import {SelectDefaultComponent} from 'src/app/shared/components/select-default/select-default.component';
import {CustomCheckboxComponent} from 'src/app/shared/components/custom-checkbox/custom-checkbox.component';
import {
  DocumentFormatSelectorComponent
} from 'src/app/shared/components/document-format-selector/document-format-selector.component';
import {ActivatedRoute, Router} from "@angular/router";
import {
  AccountV2DTO,
  AppReportTMPDTO2,
  AppReportTMPParamDTO,
  AppReportTMPParamDTO2
} from "../../../../../../../../../shared/interfaces/applications.interface";
import {ApplicationsService} from "../../../../../../applications/services/applications.service";
import {DOCUMENTS_TYPES} from "../../../../../../../../../shared/types";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {
  SuccessReportDialogComponent
} from "../../../../../../../../../core/components/agree-dialog/success-report-dialog.component";
import {dateRangeValidator} from "../../../../../../../../../shared/validators/dateRangeValidator";
import {
  DatePickerDefaultComponent
} from "../../../../../../../../../shared/components/date-picker-default/date-picker-default.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {
  AccountSelectorV2Component
} from "../../../../../../../../../shared/components/account-selector/account-selector-v2.component";

@Component({
  selector: 'app-create-new-report-v2',
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
    DocumentFormatSelectorComponent,
    DatePickerDefaultComponent,
    TranslateModule,
    AccountSelectorV2Component
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'scaleY(0)'}),
        animate('200ms ease-out', style({opacity: 1, transform: 'scaleY(1)'})),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({opacity: 0, transform: 'scaleY(0)'})),
      ]),
    ]),
  ],
  styleUrls: ['./../base.scss', '../../../../../../../../../style-classes/tab-class.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="setting-dark-light-box">
      <div class="p-5 rounded-3xl  bg-white">
        <div class="flex items-center justify-between ">
          <div>
            <h2 class="text-lg  font-semibold">{{ currentTemplate()?.template_name }}</h2>
            <p>{{ currentTemplate()?.description }}</p>
          </div>
          <button (click)="close()"
                  class="h-[30px] w-[30px] flex items-center justify-center rounded-lg hover:bg-gray-100 bg-[#EBEBEB]">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <hr class="my-5">
        @if (isFormReady && currentTemplate()) {
          <div [formGroup]="form">
            <div class="grid grid-cols-2  gap-5 mt-3">

              <div>
                @if (Input1Account()) {
                  <div
                    class="flex flex-col p-5 gap-5 mb-5  bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                    <p
                      class="text-[#101010] font-semibold uppercase text-[12px]">{{ 'new.account_for_statement_1' | translate }}</p>
                    <div>
                      <app-account-selector-v2 [dataList]="accounts()"
                                               formControlName="account_id"></app-account-selector-v2>
                      <!--                  <app-account-selector [accounts]="accounts()" formControlName="account_id" [fromValue]="true"></app-account-selector>-->
                      @if (Input1Account()?.required) {
                        <p class="text-red-500 text-xs mt-1"
                           *ngIf="form.get('account_id')?.invalid && form.get('account_id')?.touched">
                          {{ 'new_second.this_field_is_required' | translate }}</p>
                      }
                    </div>
                  </div>
                }

                <div
                  class="flex flex-col p-5 gap-5 bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                  <p
                    class="text-[#101010] font-semibold uppercase text-[12px]">{{ 'accountStatements.statement_parameters' | translate }}</p>

                  <div>
                    <div>
                      <app-select-default [size]="'medium'" formControlName="typeOfReport"
                                          [placeholder]="'Регулярность получения'"
                                          [options]="OP_TYPES" [required]="true" [readonly]="!!updateGetId()"
                                          [isTranslate]="true"/>
                    </div>
                    <p class="text-red-500 text-xs mt-1"
                       *ngIf="form.get('typeOfReport')?.invalid && form.get('typeOfReport')?.touched">
                      {{ 'new_second.this_field_is_required' | translate }}
                    </p>
                  </div>

                  @if (form.get('typeOfReport')?.value === "REGULAR") {
                    <div>
                      <div>
                        <app-select-default
                          [size]="'medium'"
                          [placeholder]="'Получения выписки'"
                          formControlName="frequency"
                          [options]="RG_LIST"
                        />
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('frequency')?.invalid && form.get('frequency')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  }

                  @if (Input2DateRange()) {
                    <div>
                      <app-datepicker-default [mode]="'range'" formControlName="dateRange" [minDate]="minDate()"
                                              [maxDate]="maxDate()"></app-datepicker-default>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('dateRange')?.touched && form.get('dateRange')?.errors?.['required']">
                        Укажите период (начало и конец)
                      </p>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('dateRange')?.touched && form.get('dateRange')?.errors?.['dateOrder']">
                        Дата начала не может быть позже даты окончания
                      </p>
                    </div>
                  }

                  @if (Input5SingleDate()) {
                    <div>
                      <app-datepicker-default [mode]="'single'" formControlName="date" [minDate]="minDate()"
                                              [maxDate]="maxDate()"></app-datepicker-default>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('date')?.touched && form.get('date')?.errors?.['required']">
                        Укажите дату
                      </p>
                    </div>
                  }
                </div>
                <div class="mt-4 flex items-center gap-4">
                  @if (Input4Direction()) {
                    <app-custom-checkbox [label]="'accountStatements.daily_turnover' | translate"
                                         formControlName="include_balances"></app-custom-checkbox>
                  }
                  <app-custom-checkbox [label]="'accountStatements.skip_empty' | translate"
                                       formControlName="skip_empty"></app-custom-checkbox>
                </div>
              </div>
              <div>

                @if (Input9SortByDate()) {
                  <div style="width: 300px" class="mb-4">
                    <div>
                      <app-select-default [size]="'small'" formControlName="sort"
                                          [placeholder]="Input9SortByDate()?.label || ''"
                                          [options]="Input9SortByDate()?.items || []"
                                          [required]="Input9SortByDate()?.required || false"
                                          [backgroundColor]="'#F7F7F7'"/>
                    </div>
                    <p class="text-red-500 text-xs mt-1"
                       *ngIf="form.get('sort')?.invalid && form.get('sort')?.touched">
                      {{ 'new_second.this_field_is_required' | translate }}
                    </p>
                  </div>
                }

                <div
                  class="flex flex-col p-5 gap-5  bg-[#F7F7F7] dark:bg-[#171717] rounded-[20px] border border-[#EBEBEB]">
                  <!--                  <p class="text-[#101010] font-semibold uppercase text-[12px]">{{'accountStatements.filter_data' | translate}}</p>-->

                  @if (Input3Direction()) {
                    <div>
                      <div>
                        <app-select-default [size]="'medium'" formControlName="direction"
                                            [placeholder]="Input3Direction()?.label || ''"
                                            [options]="Input3Direction()?.items || []"
                                            [required]="Input3Direction()?.required || false"/>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('direction')?.invalid && form.get('direction')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  }

                  @if (Input6Currency()) {
                    <div>
                      <div>
                        <app-select-default [size]="'medium'" formControlName="currency_type"
                                            [placeholder]="Input6Currency()?.label || ''"
                                            [options]="Input6Currency()?.items || []"
                                            [required]="Input6Currency()?.required || false"/>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('currency_type')?.invalid && form.get('currency_type')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  }

                  @if (Input7Copy()) {
                    <div>
                      <div>
                        <app-select-default [size]="'medium'" formControlName="copies"
                                            [placeholder]="Input7Copy()?.label || ''"
                                            [options]="Input7Copy()?.items || []"
                                            [required]="Input7Copy()?.required || false"/>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('copies')?.invalid && form.get('copies')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  }

                  @if (Input8CreditDebit()) {
                    <div>
                      <div>
                        <app-select-default [size]="'medium'" formControlName="credit_debit"
                                            [placeholder]="Input8CreditDebit()?.label || ''"
                                            [options]="Input8CreditDebit()?.items || []"
                                            [required]="Input8CreditDebit()?.required || false"/>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('credit_debit')?.invalid && form.get('credit_debit')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  }

                  @if (Input10Direction()) {
                    <div>
                      <div>
                        <input class="w-full h-[56px] border border-[#ECECED] rounded-[16px] px-4 text-[14px] text-[#101010] placeholder:text-[#A3A3A3] placeholder:text-[14px] placeholder:font-normal focus:outline-none focus:border-[#008C79]"
                               formControlName="co_account"
                               [placeholder]="Input10Direction()?.label || ''"
                               inputmode="numeric"
                               maxlength="20"
                               (input)="onCoAccountInput($event)"/>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('co_account')?.errors?.['minlength'] && form.get('co_account')?.touched">
                        {{ 'new_second.must_be_20_digits' | translate }}
                      </p>
                    </div>
                  }

                  <div>
                    <p class="text-14 font-medium">
                      {{ 'accountStatements.report_format' | translate }}
                    </p>
                    <div class="mt-5">
                      <div>
                        <app-document-format-selector [gap]="8" [size]="35" formControlName="reportFileType"
                                                      [formats]="docTypes()"></app-document-format-selector>
                      </div>
                      <p class="text-red-500 text-xs mt-1"
                         *ngIf="form.get('reportFileType')?.invalid && form.get('reportFileType')?.touched">
                        {{ 'new_second.this_field_is_required' | translate }}
                      </p>
                    </div>
                  </div>
                </div>

                <!--                <div class="mt-4">-->
                <!--                  <app-custom-checkbox [label]="'Отправить выписку на электронную почту'"-->
                <!--                                       formControlName="sendEmail"></app-custom-checkbox>-->
                <!--                </div>-->

              </div>
            </div>
            <!--                  @if (currentTemplate()?.template_id === 'BALANCES_AND_SALDO') {-->
            <!--                    @if (form.get('reportType')?.value === "BALANCE_SHEET") {-->
            <!--                      <div>-->
            <!--                        <app-select-default [size]="'medium'" [placeholder]="'Включать нулевые суммы'"-->
            <!--                                            [options]="[{value: '', label: 'Включать нулевые суммы'}]"-->
            <!--                                            [required]="true"/>-->
            <!--                      </div>-->
            <!--                    }-->
            <!--                  }-->
            <!--                @if (currentTemplate()?.template_id === 'ACCOUNT_ACTIVITIES') {-->
            <!--                  @if (form.get('reportType')?.value === "ACCOUNT_ACTIVITY_INFO") {-->
            <!--                    <div class="mt-3 flex">-->
            <!--                      <div class="me-5">-->
            <!--                        <app-custom-checkbox [label]="'Дневной оборот'"-->
            <!--                                             formControlName="include_balances"></app-custom-checkbox>-->
            <!--                      </div>-->
            <!--                      <div>-->
            <!--                        <app-custom-checkbox [label]="'Включить остатки'"-->
            <!--                                             formControlName="includeResidues"></app-custom-checkbox>-->
            <!--                      </div>-->
            <!--                    </div>-->
            <!--                  }-->
            <!--                }-->
            <!--                  @if (currentTemplate()?.template_id === 'ACCOUNT_ACTIVITIES') {-->
            <!--                    @if (form.get('reportType')?.value === "ACCOUNT_ACTIVITY_INFO") {-->
            <!--                      <div>-->
            <!--                        <app-select-default [size]="'medium'" [placeholder]="'Контрагент'"-->
            <!--                                            [options]="[{value: '', label: 'Контрагент'}]" [required]="true"/>-->
            <!--                      </div>-->
            <!--                    } @else if (form.get('reportType')?.value === "WITH_CORRESPONDENT") {-->
            <!--                      <p class="text-[#101010] font-semibold uppercase text-[12px]">СЧЁТ КОРРЕСПОНДЕНТА</p>-->
            <!--                      <div>-->
            <!--                        <app-input-default-->
            <!--                          [label]="'Счёт'"-->
            <!--                          formControlName="correspondentAccount"-->
            <!--                          type="number"-->
            <!--                          [maxlength]="20"-->
            <!--                          inputmode="numeric"-->
            <!--                          pattern="[0-9]*"-->
            <!--                        ></app-input-default>-->
            <!--                      </div>-->
            <!--                    }-->
            <!--                  } @else if (currentTemplate()?.template_id === 'PAYMENT_DOCUMENTS_GR') {-->
            <!--                    @if (form.get('reportType')?.value === "PAYMENT_DOCUMENTS") {-->
            <!--                      <div>-->
            <!--                        <div>-->
            <!--                          <app-select-default [size]="'medium'" formControlName="currency"-->
            <!--                                              [placeholder]="'Валюта документа'"-->
            <!--                                              [options]="currList()" [required]="true"/>-->
            <!--                        </div>-->
            <!--                        <p class="text-red-500 text-xs mt-1"-->
            <!--                           *ngIf="form.get('currency')?.invalid && form.get('currency')?.touched">-->
            <!--                          {{'new_second.this_field_is_required' | translate}}-->
            <!--                        </p>-->
            <!--                      </div>-->
            <!--                    }-->
            <!--                  }-->
            <!--                  @if ( !(currentTemplateId() === 'STATEMENT_AND_CERTIFICATES' && form.get('reportType')?.value === "ACCOUNT_MOVEMENTS")) {}-->
            <div class="flex items-center justify-between w-full mt-6">
              <div>
              </div>
              <div>
                <button
                  class="p-[10px] rounded-xl border border-base text-white font-semibold bg-[#008C79]"
                  type="button"
                  (click)="saveAction()"
                  [disabled]="isSaving()"
                >{{ isSaving() ? 'Сохранение...' : (updateGetId() ? 'Обновить выписку' : 'Сформировать выписку') }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  standalone: true
})

export default class CreateNewReportV2Component {
  constructor(private applService: ApplicationsService, private toastrService: ToastrService, private _matDialog: MatDialog, private translateService: TranslateService) {
  }

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef)
  // private accountService = inject(AccountService);

  openAccount = signal<boolean>(false);
  // accounts = signal<DropDownDTO[]>([])
  accounts = signal<AccountV2DTO[]>([])
  currentTemplate = signal<AppReportTMPDTO2 | null>(null);
  isSaving = signal(false);
  docTypes = signal<DOCUMENTS_TYPES[]>(['pdf', 'excel']);
  updateGetId = signal<string>('');

  Input1Account = signal<AppReportTMPParamDTO | null>(null);
  Input2DateRange = signal<AppReportTMPParamDTO | null>(null);
  Input3Direction = signal<AppReportTMPParamDTO | null>(null);
  Input4Direction = signal<AppReportTMPParamDTO | null>(null);
  Input5SingleDate = signal<AppReportTMPParamDTO | null>(null);
  Input6Currency = signal<AppReportTMPParamDTO | null>(null);
  Input7Copy = signal<AppReportTMPParamDTO | null>(null);
  Input8CreditDebit = signal<AppReportTMPParamDTO | null>(null);
  Input9SortByDate = signal<AppReportTMPParamDTO | null>(null);
  Input10Direction = signal<AppReportTMPParamDTO | null>(null);

  today = new Date();

  minDate = signal<Date | null>(null);
  maxDate = signal<Date | null>(null);

  public readonly OP_TYPES: { value: string; label: string; }[] = [
    {value: 'ONE_TIME', label: 'accountStatements.one_time_statement'},
    {value: 'REGULAR', label: 'new_second.regular_discharge'}
  ];
  public readonly RG_LIST = [{
    value: "DAILY",
    label: this.translateService.instant('accountStatements.daily'),
  }, {value: "WEEKLY", label: this.translateService.instant('accountStatements.weekly')}, {
    value: "MONTHLY",
    label: this.translateService.instant('accountStatements.monthly')
  }];

  form!: FormGroup;
  isFormReady = false;

  async ngOnInit(): Promise<void> {
    this.isFormReady = false;

    const template_id = this.route.snapshot.queryParamMap.get('template_id');
    const regular = this.route.snapshot.queryParamMap.get('regular');
    const repeatParams = this.route.snapshot.queryParamMap.get('params');
    const format = this.route.snapshot.queryParamMap.get('format');
    const frequency = this.route.snapshot.queryParamMap.get('frequency');
    const updateId = this.route.snapshot.queryParamMap.get('updateId');
    let account = this.route.snapshot.queryParamMap.get('account');

    this.updateGetId.set(updateId ? updateId : '');

    let parsedRP: any = {};
    if (repeatParams) {
      try {
        const pRP = JSON.parse(repeatParams);
        if (typeof pRP === 'object') {
          parsedRP = pRP;
        }
      } catch (e) {
        console.warn('repeatParams JSON parse error', e);
        parsedRP = {};
      }
    }
    if (!account && parsedRP.account_id) {
      account = parsedRP.account_id;
      delete parsedRP.account_id;
    }


    if (!template_id) {
      await this.router.navigate(['/reports/list']);
      return;
    }

    this.applService.getReportForm(template_id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      if (!res) {
        this.router.navigate(['/reports/list']);
        return;
      }

      this.currentTemplate.set(res);
      this.docTypes.set(res.output_formats || []);
      const resParams: AppReportTMPParamDTO2[] = res.parameters;
      const newRParams: AppReportTMPParamDTO[] = resParams.map((vRes) => ({
        label: vRes.label,
        input: vRes.input,
        required: vRes.required,
        id: vRes.id,
        items: vRes.items && vRes.items.length > 0 ? vRes.items.map((iRes) => ({
          value: iRes.value,
          label: iRes.text
        })) : []
      }))
      this.generateForms(res.template_id, newRParams, account || "", format || '', frequency || '');

      this.form.patchValue({
        typeOfReport: regular !== null ? "REGULAR" : "ONE_TIME"
      });

      const initial = this.form.get('typeOfReport')?.value;
      if (initial === 'REGULAR') {
        this.minDate.set(this.today);
        this.maxDate.set(null);
      } else {
        this.minDate.set(null);
        this.maxDate.set(this.today);
      }

      this.form.get('typeOfReport')?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          const dateControl = this.form.get('dateRange');

          dateControl?.reset();

          if (value === 'REGULAR') {
            this.minDate.set(this.today);
            this.maxDate.set(null);
          } else {
            this.minDate.set(null);
            this.maxDate.set(this.today);
          }

          dateControl?.updateValueAndValidity();
        });

      this.isFormReady = true;

      this.applyRepeatParams(parsedRP);
    });
  }

  // getAccounts() {
  //   return this.accountService.getAccountList({
  //     size: 500,
  //     page: 0
  //   }, {
  //     isReal: false,
  //     toAmount: null,
  //     accountOrderEnums: null,
  //     fromAmount: null,
  //     businessUserId: null,
  //     accountPrefixes: null,
  //     isActive: null,
  //     customerId: null,
  //     currencyEnum: null,
  //     withBlock: null,
  //     accountsNotIn: null,
  //     canDoOperation: null,
  //     currencyType: null,
  //     accountNumber: null,
  //     searchText: null,
  //     visible: null,
  //     prefixes: null,
  //     userId: null,
  //   }).pipe(
  //     takeUntilDestroyed(this.destroyRef),
  //     map((res: any) => res.content || [])
  //   );
  //   //   .subscribe((accounts: any) => {
  //   //   this.accounts.set(accounts);
  //   //   if (accounts.length > 0) {
  //   //     const fnd = accounts.find((val) => val.altAcctId === account);
  //   //     if (fnd) {
  //   //       this.form.patchValue({
  //   //         account: fnd.altAcctId
  //   //       })
  //   //     }
  //   //     else {
  //   //       this.form.patchValue({
  //   //         account: accounts[0].altAcctId
  //   //       })
  //   //     }
  //   //   }
  //   // })
  // }

  generateForms(template_id: string, params: AppReportTMPParamDTO[], account: string, format: string, frequency: string) {
    const group: any = {};

    params.forEach((p) => {
      console.log(p);
      const validators: ValidatorFn[] = [];

      if (p.required) {
        validators.push(Validators.required);
      }

      switch (p.id) {
        case 'account_id':
          group['account_id'] = ['', validators];
          this.Input1Account.set(p);
          // this.getAccounts().subscribe((res: Account[]) => {
          //   this.accounts.set(res);
          //   const fnd = res.find((v) => (v.altAcctId === account));
          //   this.form.patchValue({
          //     account_id: fnd ? String(fnd.value) : String(res[0]?.value)
          //   });
          // });
          this.applService.postReportFItems(template_id, p.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
              // console.log(res);
              this.accounts.set(res);
              const fnd = res.find((v) => (v.text === account || v.value === account));
              this.form.patchValue({
                account_id: fnd ? fnd.value : res[0]?.value
              });
            });
          break;

        case 'date_from':
          group['dateRange'] = this.fb.control(
            null,
            p.required ? [dateRangeValidator(true), Validators.required] : [dateRangeValidator(true)]
          );
          this.Input2DateRange.set(p);
          break;

        case 'direction':
          group['direction'] = [p.items.length > 0 ? p.items[0].value : '', validators];
          this.Input3Direction.set(p);
          break;

        case 'currency_type':
          group['currency_type'] = [p.items.length > 0 ? p.items[0].value : '', validators];
          this.Input6Currency.set(p);
          break;

        case 'copies':
          group['copies'] = [p.items.length > 0 ? p.items[0].value : '', validators];
          this.Input7Copy.set(p);
          break;

        case 'credit_debit':
          group['credit_debit'] = [p.items.length > 0 ? p.items[0].value : '', validators];
          this.Input8CreditDebit.set(p);
          break;

        case 'sort':
          group['sort'] = [null, validators];
          // console.log(p);
          this.Input9SortByDate.set(p);
          break;

        case 'include_balances':
          group['include_balances'] = [false];
          this.Input4Direction.set(p);
          break;

        case 'date':
          group['date'] = [null, validators];
          this.Input5SingleDate.set(p);
          break;

        case 'co_account':
          group['co_account'] = ['', [Validators.minLength(20), Validators.maxLength(20), Validators.pattern(/^\d*$/)]];
          this.Input10Direction.set(p);
          this.applService.postReportFItems('account-activity', 'account_id')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
              const items = res.map((item) => ({ value: item.text, label: item.text }));
              this.Input10Direction.set({ ...p, items });
            });
          break;
      }
    });

    group['skip_empty'] = [false];
    group['typeOfReport'] = ['ONE_TIME'];
    group['reportFileType'] = [
      this.docTypes().find(v => v === format)
      ?? this.docTypes()[0]
    ];
    group['frequency'] = [
      this.RG_LIST.find(v => v.value === frequency?.toUpperCase())?.value
      ?? this.RG_LIST[0].value
    ];

    this.form = this.fb.group(group);
  }

  private applyRepeatParams(parsed: any): void {
    if (!parsed || typeof parsed !== 'object') return;

    const patchData: Record<string, any> = {};

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    Object.keys(parsed).forEach(key => {
      if (this.form.contains(key)) {
        patchData[key] = parsed[key];
      }
      if (this.form.contains('dateRange')) {
        if (key === 'date_from' && parsed[key]) {
          const d = new Date(parsed[key]);
          if (!isNaN(d.getTime())) {
            rangeStart = d;
          }
        }

        if (key === 'date_to' && parsed[key]) {
          const d = new Date(parsed[key]);
          if (!isNaN(d.getTime())) {
            rangeEnd = d;
          }
        }
      }
    });

    if (this.form.contains('dateRange') && rangeStart) {
      if (!rangeEnd || rangeEnd > rangeStart) {
        patchData['dateRange'] = {
          start: rangeStart,
          end: rangeEnd
        };
      }
    }
    // console.log("patchData", patchData);
    if (Object.keys(patchData).length > 0) {
      this.form.patchValue(patchData);
    }
  }

  close() {
    this.router.navigate(['/reports/list']).then(() => "");
  }

  saveAction() {
    if (this.form.invalid) {
      // console.log(this.form.invalid);
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const dateControlValue = this.form.get('dateRange')?.value as
      | { start: Date | string; end: Date | string }
      | null
      | undefined;

    let dateBegin: string | undefined = undefined;
    let dateClose: string | undefined = undefined;
    let singleDate: string | undefined = undefined;

    if (dateControlValue && (dateControlValue as any).start) {
      dateBegin = this.formatDate((dateControlValue as any).start);
    }
    if (dateControlValue && (dateControlValue as any).end) {
      dateClose = this.formatDate((dateControlValue as any).end);
    }
    if (this.form.value.date) {
      singleDate = this.formatDate(this.form.value.date);
    }

    if (this.currentTemplate()) {
      const params = {
        account_id: String(this.form.value.account_id),
        date_from: dateBegin,
        date_to: dateClose,
        direction: this.form.value.direction,
        date: singleDate,
        include_balances: this.form.value.include_balances,
        skip_empty: this.form.value.skip_empty,
        sort: this.form.value.sort || undefined,
        currency_type: this.form.value.currency_type || undefined,
        credit_debit: this.form.value.credit_debit || undefined,
        co_account: this.form.value.co_account || undefined,
      };
      if (this.form.value.typeOfReport === "REGULAR") {
        if (this.updateGetId()) {
          this.applService.putReportPeriodic(this.updateGetId(), this.form.value.reportFileType!, this.form.value.frequency!, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res) => {
              // console.log(res);
              this.isSaving.set(false);
              if (res && res.id) {
                this.toastrService.success('Успешно!');
                this.showDetails();
              } else {
                this.toastrService.error('Неизвестная ошибка!');
              }
            },
            error: (err) => {
              this.isSaving.set(false);
              const message = err.message || err || 'Неизвестная ошибка!';
              this.toastrService.error(message);
            }
          });
        } else {
          this.applService.postReportPeriodic(this.currentTemplate()?.template_id || "", this.form.value.reportFileType!, this.form.value.frequency!, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res) => {
              // console.log(res);
              this.isSaving.set(false);
              if (res && res.id) {
                this.toastrService.success('Успешно!');
                this.showDetails();
              } else {
                this.toastrService.error('Неизвестная ошибка!');
              }
            },
            error: (err) => {
              this.isSaving.set(false);
              const message = err.message || err || 'Неизвестная ошибка!';
              this.toastrService.error(message);
            }
          });
        }
      } else {
        if (!this.updateGetId()) {
          this.applService.postReportGenerate(this.currentTemplate()?.template_id || "", this.form.value.reportFileType!, params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (res) => {
              console.log(res);
              this.isSaving.set(false);
              if (res && res.report_id) {
                this.toastrService.success('Успешно!');
                this.showDetails();
              } else {
                this.toastrService.error('Неизвестная ошибка!');
              }
            },
            error: (err) => {
              this.isSaving.set(false);
              const message = err.message || err || 'Неизвестная ошибка!';
              this.toastrService.error(message);
            }
          });
        } else {
          this.toastrService.error("Обновить можно только ругулярную выписку");
        }
      }
    }
  }

  onCoAccountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 20);
    this.form.get('co_account')?.setValue(input.value, { emitEvent: false });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  showDetails() {
    const dialog = this._matDialog.open(SuccessReportDialogComponent, {
      width: '504px',
    });
    dialog.afterClosed().subscribe(() => {
      if (this.form.value.typeOfReport === "REGULAR") {
        this.router.navigate(['/reports/list'], {queryParams: {regular: ''}});
      } else {
        this.router.navigate(['/reports/list']);
      }
    })
  }
}
