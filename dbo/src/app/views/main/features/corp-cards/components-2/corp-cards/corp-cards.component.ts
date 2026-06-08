import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
  ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatOption} from "@angular/material/autocomplete";
import {MatRipple} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {PaginatorComponent} from "../../../../../../shared/components/paginator/paginator.component";
import {TableActionsComponent} from "../../../../../../shared/components/table-actions/table-actions.component";
import {KeyValue, PayrollProjectResponseGroupContent} from "../../../payroll-project/models/payroll-project.type";
import {TableButton} from "../../../../../../shared/interfaces/table-button.interface";
import {emplayeesTableButton} from "../../../payroll-project/constants/table-btn";
import {TableColumn} from "../../../../../../shared/interfaces/table.interface";
import {
  CorpCardTableColumnsHeaders,
  EmployeesTableColumnsHeaders,
  SalaryTypeCardValues
} from "../../../payroll-project/constants/table-columns";
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {Router} from "@angular/router";
import {Options, TemplateService} from "../../../../../../core/services/template.service";
import {TransactionService} from "../../../../../../core/services/transaction.service";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-corp-cards',
  standalone: true,
  imports: [
    ContainerTableComponent,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatRipple,
    MatSelect,
    MatSuffix,
    NgForOf,
    NgOptimizedImage,
    PaginatorComponent,
    TableActionsComponent
  ],
  templateUrl: './corp-cards.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardsComponent  implements OnInit{
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  employees = signal<PayrollProjectResponseGroupContent[]>([])
  errorMessage = signal<string>('')
  tableActionBtns = signal<TableButton[]>(emplayeesTableButton)
  tableColumns = signal<TableColumn[]>(CorpCardTableColumnsHeaders)
  salaryTypeCards = signal<KeyValue[]>(SalaryTypeCardValues)
  selectedType = signal<string>('UNKNOWN');
  totalItems = signal<number>(0)
  selectedRows = signal<PayrollProjectResponseGroupContent[]>([])
  #destroy = inject(DestroyRef)
  private _salaryService = inject(SalaryProjectService)
  private _router = inject(Router)
  private _templateService = inject(TemplateService)
  private _transactionService = inject(TransactionService)
  private _utilsService = inject(UtilsService)

  ngOnInit() {
    this.getEmployees()
  }

  getEmployees() {
    this.isLoading.set(true)
    this._salaryService.getAllPayrollProjectGroupList(
      {
        page: this.pageIndex(),
        size: this.pageSize(),
        userType: 'CORPORATE',
        ...(this.selectedType() !== 'UNKNOWN' && {type: this.selectedType()})
      }
    ).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (!res) return
        this.errorMessage.set('')
        this.pageSize.set(res.pageable.pageSize)
        this.pageIndex.set(res.pageable.pageNumber)
        this.totalItems.set(res.totalElements)
        this.employees.set(res.content)
        this.isLoading.set(false)
      }
    )
  }

  getSelectedItem(event: { value: string }) {
    this.selectedType.set(event.value)
    this.getEmployees()
  }

  navigateToInside(event: PayrollProjectResponseGroupContent) {
    if (event.contractNumber && event.transitAccount) {
      this._router.navigate(['/corp-card-project/corp-cards/items', event.transitAccount, event.contractNumber,event.type])
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
        return this._transactionService.exportCorpCardToExcel(this.selectedRows(), 'corp-cards');
    }
    return
  };

  async printEmployeeAgreement() {
    const options: Options = {
      templateLang: 'ru',
      templateLogo: undefined,
      templatePath: `/corp-card-agreement-docs.mustache`,
      templateData: this.selectedRows(),
      templateName: 'Договора-docs'
    };
    await this._templateService.showPdfInDialog(options);
  }

  syncEmployeeCards() {
    this._utilsService.spinnerState$$.next(true)
    this._salaryService.syncAllPayrollProjectList({
      page: this.pageIndex(),
      size: this.pageSize(), userType: 'CORPORATE',
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
