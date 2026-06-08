import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AccountApi } from '../../../entities/account/account.api';
import {
  MONTH_NAMES,
  PrepareSalaryCardTransactionControls,
  SalaryCardPrepareControls,
  SalaryPrepareReqControls,
  STATEMENT_MODE,
  STATEMENT_MODE_TITLE_KEY,
  StatementMode
} from './statement-form.model';
import { filter, tap } from 'rxjs/operators';
import {combineLatest, defer, map, of, switchMap} from 'rxjs';
import { TransactionApi } from '../../../entities/transaction/transaction.api';
import { AccountResponse, DictionaryResponse } from '../../../entities/account/account.model';
import { MonthOption } from '../../../shared/models/month.model';
import { formatDate } from '@angular/common';
import { UtilsService } from '../../../core/services/utils.service';
import { SalaryApi } from '../../../entities/salary/salary.api';
import { CardType } from '../../../shared/models/card-type';
import { UserType } from '../../../shared/models/user-type.model';
import { SalaryCardsByFileParseRes } from '../../../entities/salary/salary.model';
import { parseDate, startOfDay } from '../../../shared/lib/date.utils';
import { MatDialog } from '@angular/material/dialog';
import { ExpiredEmployeesDialogComponent } from '../expired-employees-dialog/expired-employees-dialog.component';
import { CardStatus } from '../../../shared/models/card-status';
import {TransactionService} from "../../../core/services/transaction.service";
import {ActivatedRoute} from "@angular/router";
import { DEFAULT_PAGE_SIZE } from '../../../constants';

@Injectable()
export class StatementFormStore {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly accountApi = inject(AccountApi);
  private readonly transactionApi = inject(TransactionApi);
  private readonly transactionService = inject(TransactionService);
  private readonly salaryApi = inject(SalaryApi);
  private readonly utilService = inject(UtilsService);
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly mode = signal<StatementMode>(STATEMENT_MODE.EDIT);
  private readonly transactionId = signal<string | null>(null);
  readonly count = signal<number | null>(null);
  readonly bronAmount = signal<number | null>(null);

  readonly title = computed(() => STATEMENT_MODE_TITLE_KEY[this.mode()]);
  readonly fileInfo = signal<{ name: string, size: string } | null>(null);
  readonly employeeListLoading = signal(true);
  readonly submitted = signal(false);

  private readonly employeeFilter = signal('');

  employeesPage = signal(0);
  employeesSize = signal(DEFAULT_PAGE_SIZE);
  employeesTotal = computed(() => this.employeeList().length);

  employeesView = computed(() => {
    const filtered = this.employeeListFiltered();
    const start = this.employeesPage() * this.employeesSize();
    return filtered.slice(start, start + this.employeesSize());
  });

  readonly form = this.fb.group<PrepareSalaryCardTransactionControls>({
    salaryPrepareReq: this.fb.group<SalaryPrepareReqControls>({
      cardUserType: this.fb.control<UserType>('SALARY'),
      cardType: this.fb.control<CardType>('UZCARD'),
      docNum: this.fb.control(''),
      reestrNumber: this.fb.control(''),
      contractNumber: this.fb.control(''),
      useTransit: this.fb.control(true),
      senderAccount: this.fb.control('', Validators.required),
      transitAccount: this.fb.control('', Validators.required),
      name: this.fb.control('', Validators.required),
      paymentSource: this.fb.control('ACCOUNT'),
      docDate: this.fb.control(new Date(), Validators.required),
      paymentCode: this.fb.control('', Validators.required),
      year: this.fb.control(new Date().getFullYear(), Validators.required),
      months: this.fb.control<string[]>([], Validators.required),
      description: this.fb.control('', Validators.required),
    }),
    employeesItems: this.fb.array<FormGroup<SalaryCardPrepareControls>>([])
  });


  readonly invalidAmount = computed(() => {
    const selectedSenderAccount = this.selectedSenderAccount();
    const transitAccountInfo = this.transitAccountInfo();
    const useTransit = this.salaryPrepareUseTransit();
    const total = this.total();
    const bronAmount = this.bronAmount();

    if (!transitAccountInfo) return true;

    if (!selectedSenderAccount || !useTransit) {
      const available = bronAmount ? bronAmount / 100 : transitAccountInfo.balance.amount / 100;
      return total > available;
    }

    const available = bronAmount ? bronAmount / 100 : selectedSenderAccount.balance.amount / 100 + transitAccountInfo.balance.amount / 100;
    return total > available;
  });

  readonly monthsControl = this.form.controls.salaryPrepareReq.controls.months;

  readonly salaryPrepareSenderAccount = toSignal(
    this.form.controls.salaryPrepareReq.controls.senderAccount.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.senderAccount.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.senderAccount.getRawValue() }
  );


  readonly monthsInvalid = computed(() => {
    const months = this.salaryPrepareReqMonths();
    return (!months || months.length === 0) && (this.monthsControl.touched || this.submitted());
  });

  readonly salaryPrepareUseTransit = toSignal(
    this.form.controls.salaryPrepareReq.controls.useTransit.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.useTransit.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.useTransit.getRawValue() }
  );

  updateSenderAccountState = effect(() => {
    const useTransit = this.salaryPrepareUseTransit();
    const senderAccountControl = this.form.controls.salaryPrepareReq.controls.senderAccount;
    useTransit ? senderAccountControl.enable() : senderAccountControl.disable();
  })

  readonly salaryPrepareTransitAccount = toSignal(
    this.form.controls.salaryPrepareReq.controls.transitAccount.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.transitAccount.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.transitAccount.getRawValue() }
  );

  private readonly salaryPrepareReqName = toSignal(
    this.form.controls.salaryPrepareReq.controls.name.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.name.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.name.getRawValue() }
  );

  private readonly salaryPrepareReqDocDate = toSignal(
    this.form.controls.salaryPrepareReq.controls.docDate.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.docDate.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.docDate.getRawValue() }
  );

  private readonly salaryPrepareReqPaymentCode = toSignal(
    this.form.controls.salaryPrepareReq.controls.paymentCode.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.paymentCode.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.paymentCode.getRawValue() }
  );

  private readonly salaryPrepareReqMonths = toSignal(
    this.form.controls.salaryPrepareReq.controls.months.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.months.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.months.getRawValue() }
  );

  private readonly salaryPrepareReqYear = toSignal(
    this.form.controls.salaryPrepareReq.controls.year.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.year.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.year.getRawValue() }
  );

  private readonly salaryPrepareReqCardUserType = toSignal(
    this.form.controls.salaryPrepareReq.controls.cardUserType.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.cardUserType.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.cardUserType.getRawValue() }
  );

  private readonly salaryPrepareReqContractNumber = toSignal(
    this.form.controls.salaryPrepareReq.controls.contractNumber.valueChanges.pipe(
      map(() => this.form.controls.salaryPrepareReq.controls.contractNumber.getRawValue())
    ),
    { initialValue: this.form.controls.salaryPrepareReq.controls.contractNumber.getRawValue() }
  );

  readonly employeesItems = toSignal(
    this.form.controls.employeesItems.valueChanges.pipe(
      map(() => this.form.controls.employeesItems.getRawValue())
    ),
    { initialValue: this.form.controls.employeesItems.getRawValue() }
  );

  setSalaryPrepareReqDescription = effect(() => {
    const name = this.salaryPrepareReqName();
    const docDate = this.salaryPrepareReqDocDate();
    const year = this.salaryPrepareReqYear();
    const months = this.salaryPrepareReqMonths();
    const selectedPaymentCode = this.selectedPaymentCode();

    const group = this.form.controls.salaryPrepareReq;
    const descriptionControl = group.controls.description;

    if (
      !group.controls.name.valid ||
      !group.controls.docDate.valid ||
      !group.controls.paymentCode.valid ||
      !group.controls.months.valid ||
      !group.controls.year.valid
    ) {
      return;
    }

    if (descriptionControl.dirty || !selectedPaymentCode || !months?.length) {
      return;
    }

    const firstName = MONTH_NAMES[Number(months[0]) - 1];
    const lastName = MONTH_NAMES[Number(months[months.length - 1]) - 1];

    const periodStr = months.length === 1
      ? firstName
      : months.map(m => MONTH_NAMES[Number(m) - 1]).join(', ');

    const formattedDate = formatDate(docDate, 'dd.MM.yyyy', 'en-US');
    const value = `${name} от ${formattedDate}, ${selectedPaymentCode.value} за ${periodStr}, ${year}`;

    descriptionControl.setValue(value, { emitEvent: false });
  });

  readonly senderAccounts = toSignal(
    this.accountApi.getAllowedPaymentAccounts({ page: 0, size: 100, transactionMode: 'SALARY' }).pipe(
      map(res => res ? res.content : null),
      tap(content => {
        if (content && content.length && this.mode() === STATEMENT_MODE.CREATE) {
          const found = content.find(item => item.isMain);
          this.selectSenderAccount(found ?? content[0]);
        }
      })
    ),
    { initialValue: null }
  );

  readonly bronList = toSignal(
    defer(() => {
      const isKartoteka = this.activatedRoute.snapshot.queryParamMap.get('isKartoteka');
      if (!isKartoteka) return of(null);

      return this.transactionService.checkKartoteka('SALARY').pipe(
        map(res => res?.data ?? null),
        tap(content => {
          if (content?.length) {
            this.selectBron('BRON');
            this.bronAmount.set(content[0]?.amount?.amount);
          }
        })
      );
    }),
    { initialValue: null }
  );

  readonly selectedSenderAccount = computed(() => {
    const senderAccounts = this.senderAccounts();
    if (senderAccounts) {
      const found = senderAccounts.find(o => {
        return o.altAcctId === this.salaryPrepareSenderAccount();
      });
      return found ?? null;
    }
    return null;
  });

  readonly transitAccountInfo = toSignal(
    toObservable(this.salaryPrepareTransitAccount).pipe(
      filter((transitAccount) => !!transitAccount),
      switchMap(id => this.accountApi.getAccountInfo(id))
    ),
    { initialValue: null }
  );

  private readonly docNum = toSignal(
    toObservable(this.mode).pipe(
      filter((mode) => mode !== STATEMENT_MODE.EDIT),
      switchMap(() => this.accountApi.getAccountTransactionDocNum().pipe(
        filter((res) => res != null),
        tap(res => {
          this.form.patchValue({
            salaryPrepareReq: {
              docNum: res.msg,
              reestrNumber: res.msg,
              name: `Ведомость №${res.msg}`
            }
          });
        })
      ))
    ),
    { initialValue: null }
  );

  private readonly docDate = toSignal(
    toObservable(this.mode).pipe(
      filter((mode) => mode !== STATEMENT_MODE.EDIT),
      switchMap(() => this.transactionApi.getTransactionOperDay().pipe(
        filter((res) => res != null),
        tap(res => {
          const [d, m, y] = res.operDay.split('.').map(Number);
          this.form.controls.salaryPrepareReq.controls.docDate.setValue(new Date(y, m - 1, d));
        })
      ))
    ),
    { initialValue: null }
  );

  readonly paymentCodeList = toSignal(
    this.accountApi.getAccountTransactionSalaryPurposeCode().pipe(
      filter((res) => res != null),
    ),
    { initialValue: null }
  );

  readonly selectedPaymentCode = computed(() => {
    const paymentCodeList = this.paymentCodeList();
    if (!paymentCodeList) return null;

    const found = paymentCodeList.content.find(o => {
      return o.key === this.salaryPrepareReqPaymentCode();
    });
    return found ?? null;
  });

  readonly transaction = toSignal(
    toObservable(this.transactionId).pipe(
      filter((id) => id != null),
      switchMap(id => this.transactionApi.getTransactionById(id)),
      tap(res => {
        if (res) {
          this.form.controls.salaryPrepareReq.patchValue({
            cardType: res.additionalInfo.cardType,
            reestrNumber: res.docNum,
            contractNumber: res.additionalInfo.contractNumber,
            useTransit: res.additionalInfo.useTransit !== 'true',
            transitAccount: res.additionalInfo.transitAccount,
            paymentCode: res.paymentCode.toString(),
            year: Number(res.additionalInfo.year),
            months: res.additionalInfo.months.split(','),
            senderAccount: res.sender.account,
            description: res.description,
          });

          if (this.mode() === STATEMENT_MODE.EDIT) {
            this.form.controls.salaryPrepareReq.patchValue({
              docNum: res.docNum,
              docDate: parseDate(res.docDate),
              name: res.name,
            });
          }
        }
      })
    ),
    { initialValue: null }
  );

  public readonly employeeListByTransactionId = toSignal(
    toObservable(this.transactionId).pipe(
      filter((transactionId) => transactionId != null),
      switchMap(transactionId => {
        return this.salaryApi.getEmployeesByTransactionId(transactionId).pipe(
          tap(res => {
            if (res) this.count.set(res?.length);
            this.employeeListLoading.set(false);
          })
        )
      }),
    ), { initialValue: null }
  );

  selectSenderAccount(option: AccountResponse) {
    this.form.controls.salaryPrepareReq.controls.senderAccount.setValue(option.altAcctId);
  }
  selectBron(option: string) {
    this.form.controls.salaryPrepareReq.controls.paymentSource.setValue(option);
  }

  selectPurpose(option: DictionaryResponse) {
    this.form.controls.salaryPrepareReq.controls.paymentCode.setValue(option.key);
  }

  downLoadTemplate() {
    this.utilService.spinnerState$$.next(true);

    const count = this.count();
    const { cardUserType, contractNumber, transitAccount } = this.form.controls.salaryPrepareReq.getRawValue();
    if (!count) {
      this.utilService.spinnerState$$.next(false);
      return;
    }


    this.salaryApi.generateSalaryCardsFile({
      page: 0,
      size: count,
      userType: cardUserType,
      contractNumber: contractNumber,
      transitAccount: transitAccount,
    }).subscribe(res => {
      if (res?.msg) {
        const link = document.createElement('a');
        link.href = res.msg;
        link.download = 'salary-cards.xlsx';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
        link.remove();
      }

      this.utilService.spinnerState$$.next(false);
    });
  }

  uploadFile(event: Event) {
    this.utilService.spinnerState$$.next(true);

    const input = event.target as HTMLInputElement;
    this.utilService.spinnerState$$.next(false);
    if (!input.files?.length) return;

    const file = input.files[0];

    const formData = new FormData();
    formData.append('file', file);

    const { contractNumber, transitAccount } = this.form.controls.salaryPrepareReq.getRawValue();

    this.employeeListLoading.set(true);
    this.salaryApi.getEmployeesByFileUpload(formData, { contractNumber, transitAccount }).subscribe(res => {
      console.log(res)
      if (res) {
        this.fileInfo.set({ name: file.name, size: (file.size / 1024).toFixed(2) });

        this.employeeListByFileUpload.set(res);
      }

      this.employeeListLoading.set(false);
      this.utilService.spinnerState$$.next(false);
    });
  }

  prepareSalaryCardTransaction() {
    this.utilService.spinnerState$$.next(true);

    const rawValue = this.form.getRawValue();
    const senderAccountControl = this.form.controls.salaryPrepareReq.controls.senderAccount;
    const senderDisabled = senderAccountControl.disabled;
    const transactionId = this.transactionId();
    const mode = this.mode();

    return this.salaryApi.prepareSalaryCardTransaction({
      salaryPrepareReq: {
        ...rawValue.salaryPrepareReq,
        useTransit: !rawValue.salaryPrepareReq.useTransit,
        docDate: formatDate(rawValue.salaryPrepareReq.docDate, 'dd.MM.yyyy', 'ru'),
        senderAccount: senderDisabled ? rawValue.salaryPrepareReq.transitAccount : rawValue.salaryPrepareReq.senderAccount,
        ...(mode === STATEMENT_MODE.EDIT && transactionId ? { oldTransactionUuid: transactionId } : {}),
      },
      employeesItems: rawValue.employeesItems.map(item => {
        const amount = item.amountTransferToCard === '' ? 0 : Number(item.amountTransferToCard);
        return {...item, amountTransferToCard: Math.round(amount * 100) };
      })
    }).pipe(tap(() => this.utilService.spinnerState$$.next(false)));
  }

  readonly employeeListByFileUpload = signal<SalaryCardsByFileParseRes | null>(null);

  readonly employeeListAll = toSignal(
    combineLatest([
      toObservable(this.salaryPrepareReqCardUserType),
      toObservable(this.salaryPrepareReqContractNumber),
      toObservable(this.salaryPrepareTransitAccount),
      toObservable(this.count),
      toObservable(this.transactionId),
    ]).pipe(
      filter(([cardUserType, contractNumber, transitAccount, count, transactionId]) => {
        return transactionId === null && count !== null;
      }),
      switchMap(([cardUserType, contractNumber, transitAccount, count, transactionId]) => {
        this.employeeListLoading.set(true);

        return this.salaryApi.getEmployeesAll({
          page: 0,
          size: count!,
          userType: cardUserType,
          contractNumber: contractNumber,
          transitAccount: transitAccount,
          employeeStatus: 'ACTIVE'
        }).pipe(
          map(res => {
            if (!res?.content) return null;

            const expiredEmployees =  res?.content.filter(item => {
              return item.status === 'BLOCKED';
            });

            if (expiredEmployees.length) {
              this.dialog.open(ExpiredEmployeesDialogComponent, {
                width: '480px',
                height: '100%',
                position: { right: '0' },
                panelClass: 'right-side-dialog',
                data: { employees: expiredEmployees },
              });
            }

            return res.content;
          }),
        )
      }),
      tap(() => this.employeeListLoading.set(false))
    ),
    { initialValue: null }
  );

  readonly employeeList = computed(() => {
    const employeeListAll = this.employeeListAll();
    const employeeListByFileUpload = this.employeeListByFileUpload();
    const employeeListByTransactionId = this.employeeListByTransactionId();

    const sortByExpiredLast = <T extends { status: CardStatus }>(list: T[]): T[] =>
      [...list].sort((a, b) => {
        if (a.status === 'BLOCKED' && b.status !== 'BLOCKED') return 1;
        if (a.status !== 'BLOCKED' && b.status === 'BLOCKED') return -1;
        return 0;
      });

    if (employeeListByTransactionId?.length) return sortByExpiredLast(employeeListByTransactionId);
    if (employeeListByFileUpload?.successList?.length) return sortByExpiredLast(employeeListByFileUpload.successList);
    if (employeeListAll?.length) return sortByExpiredLast(employeeListAll);

    return [];
  });

  setEmployeesItems = effect(() => {
    this.form.controls.employeesItems.clear();

    this.employeeList().forEach(employee => {
      const amount = employee.balance.amount / 100;
      this.form.controls.employeesItems.push(
        this.fb.group<SalaryCardPrepareControls>({
          accountNumberCard: this.fb.control(employee.account),
          amountTransferToCard: this.fb.control({ value: amount === 0 ? '' : amount, disabled: employee.status === 'BLOCKED' }),
          fio: this.fb.control(employee.ownerName),
          maskedPan: this.fb.control(employee.maskedPan),
        })
      )
    });
  })

  readonly employeeListFiltered = computed(() => {
    const list = this.employeeList();
    const term = this.employeeFilter().trim().toLowerCase();

    if (!term) return list;

    return list.filter((item) =>
      item.ownerName.toLowerCase().includes(term) ||
      item.account.toLowerCase().includes(term)
    );
  });

  readonly total = computed(() => {
    this.employeesItems();
    return this.form.controls.employeesItems.controls.reduce((acc, group) => {
      const amountControl = group.controls.amountTransferToCard;
      if (amountControl.disabled) return acc;
      const amount = amountControl.value;
      return acc + (amount ? amount : 0);
    }, 0);
  });

  readonly employeesFilledCount = computed(() => {
    const employeeItems = this.employeesItems();
    return employeeItems.reduce((acc, cur) => {
      if (cur.amountTransferToCard) {
        return acc + 1;
      }
      return acc
    }, 0);
  });

  setEmployeeFilter(value: string) {
    this.employeeFilter.set(value);
  }

  create(mode: StatementMode, contractNumber: string, cardType: CardType, count: string, transitAccount: string) {
    this.form.controls.salaryPrepareReq.patchValue({ contractNumber, transitAccount, cardType });
    this.mode.set(mode);
    this.count.set(Number(count));
  }

  init(mode: StatementMode, transactionId: string) {
    this.mode.set(mode);
    this.transactionId.set(transactionId);
  }
}
