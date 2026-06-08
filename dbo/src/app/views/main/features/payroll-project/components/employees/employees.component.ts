import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {emplayeesTableButton} from '../../constants/table-btn';
import {SalaryProjectService} from '../../../../../../core/services/salary-project.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { EmployeesTableColumnsHeaders } from '../../constants/table-columns';
import {TableButton} from "../../../../../../shared/interfaces/table-button.interface";
import {TableColumn} from "../../../../../../shared/interfaces/table.interface";
import {
  PayrollProjectResponseContent,
  PayrollProjectResponseGroupContent
} from "../../models/payroll-project.type";
import {Router} from "@angular/router";
import {Options, TemplateService} from "../../../../../../core/services/template.service";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import {PaginationComponent} from "../../../../../../shared/components/pagination/pagination.component";
import { debounceTime } from "rxjs";
import { PageLayoutComponent } from "../../../../../../shared/components/page-layout/page-layout.component";
import { IconComponent, IconName } from '../../../../../../shared/ui/icon/icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataStateWrapperComponent } from '../../../../../../shared/ui/data-state-wrapper/data-state-wrapper.component';
import { FilterConfig } from '../../../../../../shared/components/table-filters/table-filters.model';
import { DomSanitizer } from '@angular/platform-browser';
import { TableFiltersComponent } from '../../../../../../shared/components/table-filters/table-filters.component';
import { DEFAULT_PAGE_SIZE } from 'src/app/constants';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    MatMenuTrigger,
    MatMenu,
    ReactiveFormsModule,
    PaginationComponent,
    PageLayoutComponent,
    IconComponent,
    TranslateModule,
    DataStateWrapperComponent,
    TableFiltersComponent
  ],
  templateUrl: './employees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeesComponent implements OnInit {
  #destroy = inject(DestroyRef)
  private _salaryService = inject(SalaryProjectService)
  private _router = inject(Router)
  private _templateService = inject(TemplateService)
  private _transactionService = inject(TransactionService)
  private _utilsService = inject(UtilsService)
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  search = new FormControl('');

  pageIndex = signal<number>(0);
  pageIndexState = signal<number>(0);
  pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  isLoading = signal<boolean>(false);
  employees =  signal<PayrollProjectResponseContent[]>([]);
  filteredEmployees =  signal<PayrollProjectResponseContent[]>([]);
  errorMessage = signal<string>('');
  tableActionBtns = signal<TableButton[]>(emplayeesTableButton);
  tableColumns = signal<TableColumn[]>(EmployeesTableColumnsHeaders);



  public readonly filterConfig: FilterConfig[] = [
    { name: 'searchText', type: 'search', placeholder: 'Поиск', hideDialog: true },
    {
      name: 'cardType',
      type: 'select',
      placeholder: 'Тип карты',
      options: [
        {
          label: 'Humo',
          value: 'HUMO',
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.3865 4.48419C20.3768 4.49622 20.3656 4.50941 20.3536 4.52355C20.2772 4.61359 20.1682 4.74207 20.2073 4.85479C20.2359 4.93661 20.3574 4.95471 20.4725 4.97185C20.5394 4.98182 20.6041 4.99146 20.6472 5.01313C20.8473 5.11441 20.9279 5.3176 20.9218 5.53339C20.9167 5.70497 20.9139 6.88365 20.9096 8.67167L20.9096 8.67283L20.9096 8.67826V8.67849L20.9096 8.68459C20.9076 9.5108 20.9053 10.4665 20.9023 11.5126C18.0228 11.4957 15.1438 11.4784 12.2645 11.4611L12.2272 11.4609C12.1709 10.7352 12.1521 9.92141 12.2034 9.03592C12.2507 8.21966 12.354 7.40692 12.512 6.60513C12.5811 6.25415 12.6607 5.90525 12.7506 5.55903C12.7839 5.43038 12.8369 5.29186 12.8915 5.14948C12.9984 4.87048 13.1109 4.57662 13.0918 4.31304C13.0882 4.25971 13.0757 4.20493 13.0423 4.16318C12.9646 4.06603 12.8156 4.08195 12.6957 4.11295C11.9593 4.30394 11.2434 4.7008 10.6793 5.21445C10.506 5.37237 10.0418 5.81761 9.62108 6.57867C8.50781 8.59275 8.42065 11.445 8.42065 11.445C8.36439 13.2894 8.29236 17.0265 10.2372 20.9067C10.2372 20.9067 11.6002 23.6266 13.5493 24.2967C13.9344 24.4294 14.039 24.3416 14.0721 24.2984C14.1951 24.1393 14.0052 23.8873 13.8772 23.7174C13.847 23.6774 13.8202 23.6418 13.8018 23.6132C13.6242 23.3356 13.4724 23.0417 13.3417 22.739C13.0712 22.113 12.8921 21.4501 12.7585 20.7818C12.3514 18.7477 12.088 16.6894 12.1443 14.6122L20.9023 14.6122V22.4195C20.9023 22.9371 21.1112 23.4342 21.5839 23.6773C21.8685 23.8238 22.1905 23.8757 22.5077 23.9152C23.0628 23.9848 23.6291 24.0237 24.1781 23.917C24.4995 23.8548 24.8201 23.7374 25.0599 23.5127C25.446 23.1502 25.452 22.6599 25.452 22.1661C25.452 20.3293 25.4599 18.4924 25.4679 16.6555C25.477 14.571 25.4861 12.4865 25.4835 10.402C25.4822 9.42927 25.4757 8.45674 25.464 7.48422C25.4483 6.16382 25.0421 4.83372 23.8877 4.09291C23.3891 3.77294 22.8178 3.59766 22.2593 3.59766C21.5587 3.59766 20.8784 3.87319 20.3865 4.48419Z" fill="url(#paint0_linear_3766_75930)"/><path d="M5.42399 13.8601C5.47985 12.2472 5.5707 10.625 6.72161 9.23538C6.78405 9.15994 6.84371 9.08105 6.90342 9.00208C7.14524 8.68227 7.38802 8.3612 7.82056 8.26307C7.11241 10.3906 7.10055 12.816 7.3827 15.0213C7.47621 15.752 7.63293 16.4562 7.79744 17.171C8.55223 20.4515 9.93088 24.2331 13.4655 25.2777C13.9817 25.4303 13.7894 25.7525 13.4986 25.9625C12.9077 26.39 12.1106 26.409 11.9763 26.4044C8.68625 26.2943 6.76254 24.8635 6.76254 24.8635C4.56158 23.2269 3.64207 20.8139 3.62713 19.5745C3.62345 19.2553 3.67521 18.6547 3.88003 18.003C3.94325 17.8014 4.23645 16.8671 4.4959 16.8938C4.64971 16.9097 4.72134 17.2559 4.80182 17.6448C4.81532 17.7101 4.82908 17.7766 4.84352 17.843C5.20036 19.4864 5.90052 20.7126 6.46238 21.6965C6.67292 22.0652 6.99354 22.5834 7.4494 23.1723C7.76511 23.5305 8.24532 23.9983 8.91828 24.417C9.64524 24.8693 10.3256 25.0956 10.8058 25.2147C10.2001 24.8104 9.41056 24.1998 8.62405 23.3213C8.40328 23.0747 7.65605 22.2186 6.96776 20.9184C6.66125 20.3393 5.29325 17.6458 5.42399 13.8601Z" fill="url(#paint1_linear_3766_75930)"/><defs><linearGradient id="paint0_linear_3766_75930" x1="4.26325" y1="14.9983" x2="25.4731" y2="14.9983" gradientUnits="userSpaceOnUse"><stop offset="0.33" stop-color="#9C8937"/><stop offset="0.56" stop-color="#F7E69E"/><stop offset="0.8" stop-color="#B39F4D"/></linearGradient><linearGradient id="paint1_linear_3766_75930" x1="4.26325" y1="14.9983" x2="25.4731" y2="14.9983" gradientUnits="userSpaceOnUse"><stop offset="0.33" stop-color="#9C8937"/><stop offset="0.56" stop-color="#F7E69E"/><stop offset="0.8" stop-color="#B39F4D"/></defs></svg>')
        },
        {
          label: 'Uzcard',
          value: 'UZCARD',
          icon: this.sanitizer.bypassSecurityTrustHtml('<svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M24.9445 16.0718C24.9445 19.6642 24.1406 22.3413 22.5343 24.0856C20.928 25.83 18.446 26.7018 15.0998 26.7018C11.9735 26.7018 9.60172 25.8297 7.98434 24.0856C6.36695 22.3415 5.5584 19.7111 5.55859 16.1945V4.39581C5.55935 4.11942 5.77852 3.8955 6.04916 3.89453H11.7179C11.9886 3.89536 12.2079 4.11932 12.2087 4.39581V16.4524C12.2087 17.8883 12.4688 18.9934 12.9981 19.773C13.9511 21.0633 15.7479 21.3202 17.0113 20.347C17.2009 20.201 17.3719 20.0315 17.5205 19.8424C18.038 19.1109 18.2958 18.0328 18.2941 16.6083V14.3505H24.9445V16.0718Z" fill="#203E7A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M24.9448 13.0317H18.2947V4.41954C18.2955 4.12995 18.5252 3.89536 18.8088 3.89458H19.7272C19.7292 6.83514 22.064 9.21783 24.9434 9.21783H24.9448V13.0317Z" fill="#203E7A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.034 3.89453H24.4308C24.7143 3.89536 24.9441 4.1299 24.9448 4.41949V7.89269C22.785 7.89269 21.034 6.10461 21.034 3.89885V3.89453Z" fill="#F4821F"/></svg>')
        },
      ]
    },
    {
      name: 'status',
      type: 'select',
      placeholder: 'Статус',
      options: [
        {
          iconName: 'successCircle',
          svgClass: 'fill-[#1fc16b]',
          label: this.translate.instant('loans.active'),
          value: 'ACTIVE'
        },
        {
          iconName: 'cartCircle',
          svgClass: 'fill-[#fb3748]',
          label: this.translate.instant('new.deleted'),
          value: 'DELETED'
        },
        {
          iconName: 'lockCircle',
          svgClass: 'fill-[#fb3748]',
          label: this.translate.instant('salaryStatements.blocked'),
          value: 'BLOCKED'
        },
      ]
    },
    {
      name: 'fromAmount',
      type: 'amount',
      placeholder: 'new.from',
    },
    {
      name: 'toAmount',
      type: 'amount',
      placeholder: 'new.to',
    },
  ];

  salaryTypeCards = signal<{ key: string, value: string | undefined }[]>([
    { key: 'Все', value: undefined },
    { key: 'Uzcard', value: 'UZCARD' },
    { key: 'Humo', value: 'HUMO' },
  ])
  selectedType = signal(this.salaryTypeCards()[0]);

  salaryStatusCards = signal<
    { key: string, value: string | undefined, icon?: IconName, svgClass?: string }[]
  >([
    { key: 'Все', value: undefined },
    { key: 'Активный', value: 'ACTIVE', icon: 'successCircle', svgClass: 'fill-[#1fc16b]' },
    { key: 'Удалён', value: 'DELETED', icon: 'cartCircle', svgClass: 'fill-[#fb3748]' },
    { key: 'Заблокирован', value: 'BLOCKED', icon: 'lockCircle', svgClass: 'fill-[#fb3748]' },
  ])
  selectedStatus = signal(this.salaryStatusCards()[0]);

  totalItems = signal<number>(0)
  selectedRows = signal<PayrollProjectResponseGroupContent[]>([])

  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.#destroy)
    ).subscribe(value => {
      const searchValue = value?.toLowerCase() ?? '';

      this.filteredEmployees.set(
        this.employees().filter(employee =>
          employee.ownerName.toLowerCase().includes(searchValue) || employee.pan.toLowerCase().includes(searchValue)
        )
      );

      if (searchValue) {
        this.pageIndex.set(0);
      } else {
        this.pageIndex.set(this.pageIndexState());
      }

    });

    this.getEmployees()
  }

  getEmployees() {
    this.isLoading.set(true)

    this._salaryService.getAllPayrollProjectList({
      page: this.pageIndex(),
      size: this.pageSize(),
      userType: 'SALARY',
      type: this.selectedType().value,
      status: this.selectedStatus().value,
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return;
      this.errorMessage.set('')
      this.pageSize.set(res.pageable.pageSize)
      this.pageIndex.set(res.pageable.pageNumber);
      this.pageIndexState.set(res.pageable.pageNumber);
      this.totalItems.set(res.totalElements)
      this.employees.set(res.content)

      const searchValue = this.search.value?.toLowerCase() ?? '';
      this.filteredEmployees.set(
        res.content.filter(employee =>
          employee.ownerName.toLowerCase().includes(searchValue)
        )
      );

      this.isLoading.set(false)
    })
  }
  formatExpireDate(expiry:string){
    return  expiry ? expiry.slice(0, 2) + '/' +expiry.slice(2) : '';
  }

  selectCardType(type: { key: string, value: string | undefined }) {
    this.selectedType.set(type);
    this.getEmployees();
  }

  selectCardStatus(status: { key: string, value: string | undefined }) {
    this.selectedStatus.set(status);
    this.getEmployees();
  }

  navigateToInside(event: PayrollProjectResponseGroupContent) {
    if (event.contractNumber && event.transitAccount) {
      this._router.navigate(['/payroll-project/employees/cards', event.transitAccount, event.contractNumber,event.type])
    }
  }


  onSelectedRows(rows: PayrollProjectResponseGroupContent[]) {
    this.selectedRows.set(rows)
    this.toggleForAnyElement()
    this.tableActionBtns.set([...this.tableActionBtns()])
  }

  toggleForAnyElement() {
    if (this.selectedRows().length) {
      this.tableActionBtns().forEach(el => {
        el.active = true;
      });
    } else {
      this.tableActionBtns().forEach(el => {
        el.active = false;
      })
    }
  }

  onActionClick(id: string) {
    switch (id) {
      case 'print-employee-agreements':
        return this.printEmployeeAgreement()
      case 'excel-employee-agreements':
        return this._transactionService.exportEmployeesAgreementToExcel(this.selectedRows(), 'employee-agreements');
    }
    return
  };

  async printEmployeeAgreement() {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: `/employee-agreement-docs.mustache`,
      templateData: this.selectedRows(),
      templateName: 'Договора-docs'
    };
    await this._templateService.showPdfInDialog(options);
  }

  syncEmployeeCards() {
    this._utilsService.spinnerState$$.next(true)
    this._salaryService.syncAllPayrollProjectList({
      page: this.pageIndex(),
      size: this.pageSize(), userType: 'SALARY',
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return
      this._utilsService.spinnerState$$.next(false)
      this.getEmployees()
    })
  }

  pageChange(value: any) {
    this.pageIndex.set(+value?.page)
    this.pageSize.set(+value?.size)
    this.getEmployees();
  }
}
