import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {
    ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {PaginatorComponent} from "../../../../../../shared/components/paginator/paginator.component";
import {EmployeeContent} from "../../../salary-project/salary-project.model";
import {TableColumn} from "../../../../../../shared/interfaces/table.interface";
import {EmployeePendingCardsTableColumnsHeaders} from "../../../payroll-project/constants/table-columns";
import {SalaryProjectService} from "../../../../../../core/services/salary-project.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-pending-corp-cards',
    imports: [
        ContainerTableComponent,
        PaginatorComponent
    ],
    templateUrl: './pending-corp-cards.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PendingCorpCardsComponent {
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  pendingCards = signal<EmployeeContent[]>([])
  errorMessage = signal<string>('')
  totalItems = signal<number>(0)
  tableColumns = signal<TableColumn[]>(EmployeePendingCardsTableColumnsHeaders)
  private _salaryService = inject(SalaryProjectService)
  #destroy = inject(DestroyRef)

  ngOnInit(): void {
    this.getPendingCards()
  }

  getPendingCards() {
    this.isLoading.set(true)
    this._salaryService.getEmployeesV2(
      {
        page: this.pageIndex(),
        size: this.pageSize(),
      },'CORPORATE',
    ).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (!res) return
        this.errorMessage.set('')
        this.pageSize.set(res.size)
        this.pageIndex.set(res.number)
        this.totalItems.set(res.totalElements)
        const updatedContent = res.content.map(card => {
          const passportInformation = card.passportSerial + ' ' + card.passportNumber
          const status = card.employeeStatus
          const phone = this.formatUzbekPhoneNumber(card.phoneNumber)
          return {
            ...card,
            passportInformation,
            status,
            phone
          }
        })

        this.pendingCards.set(updatedContent)
        this.isLoading.set(false)
      }
    )
  }
  formatUzbekPhoneNumber(phone: string): string {

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    return phone;
  }

  pageChange(value: any) {
    this.pageIndex.set(+value?.page)
    this.pageSize.set(+value?.size)
    this.getPendingCards();
  }
}
