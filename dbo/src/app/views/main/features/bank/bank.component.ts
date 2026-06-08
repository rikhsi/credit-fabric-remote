import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EptService } from '../../../../core/services/ept.service';
import {
  ContainerTableComponent
} from '../../../../shared/components/common/container-table/container-table.component';
import { eptNav } from './constants/ept-nav';
import { PaginatorComponent } from '../../../../shared/components/paginator/paginator.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EptDoc } from './interfaces/ept.interface';
import { eptTableColumnsHeaders } from './constants/table-columns';
import { MatDialog } from '@angular/material/dialog';
import { EptModalComponent } from './components/ept-modal/ept-modal.component';
import { UtilsService } from '../../../../core/services/utils.service';
import { TableActionsComponent } from '../../../../shared/components/table-actions/table-actions.component';
import { BankTableActions } from './constants/table-btns';
import { FilterButtonComponent } from '../../../../shared/components/common/filter-button/filter-button.component';

@Component({
    selector: 'app-bank',
    imports: [
        RouterLinkActive,
        RouterOutlet,
        RouterLink,
        ContainerTableComponent,
        PaginatorComponent,
        TableActionsComponent,
        FilterButtonComponent
    ],
    templateUrl: './bank.component.html',
    styleUrls: ['./bank.component.scss'],
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankComponent implements OnInit {
  bankNav = eptNav;

  errorMessage = '';
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  tableData: EptDoc[] = [];
  loading = false;

  selectedNav = '';
  filterState = false;

  constructor(
    private destroyRef: DestroyRef,
    private toastrService: ToastrService,
    private eptService: EptService,
    private _cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog,
    private utilsService: UtilsService,
  ) {
  }

  ngOnInit() {
    this.wathcRoute();
  }

  wathcRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.selectedNav = query['tab'];
        if(this.selectedNav) {
          this.getBankMails();
        } else {
          this.router.navigate(['bank'], {
            queryParams: {
              tab: this.bankNav[0].value,
            }
          })
        }
      })
  }

  getBankMails() {
    if(!this.selectedNav) return;

    this.loading = true;
    this._cdRef.markForCheck();

    this.eptService.getDocs(this.selectedNav)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.errorMessage = '';
          this._cdRef.markForCheck();
          if(!res.data) return;
          this.tableData = res.data;
          this._cdRef.markForCheck();
        },
        error: (err) => {
          this.errorMessage = err.message || err || 'Что-то пошло не так!';
          this.loading = false;
          this._cdRef.markForCheck();
        }
      })
  }

  onSelectedRows(event: any) {}

  eptCLicked(eptDoc: any) {
    this.loadDocOperations(eptDoc)
  }

  loadDocOperations(eptDoc: any) {
    this.utilsService.spinnerState$$.next(true);
    this.eptService.getOperationByDocId(eptDoc.documentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.utilsService.spinnerState$$.next(false);
          if(!res) return;
          this.openDetails(eptDoc, res.data);
        },
        error: (err) => {
          this.utilsService.spinnerState$$.next(false);
        }
      });
  }

  openDetails(eptDoc: any, operations: any) {
    this.matDialog.open(EptModalComponent, {
      width: '668px',
      height: '100%',
      position: {right: '0'},
      panelClass: 'right-side-dialog',
      data: { ept: eptDoc, operations },
    }).afterClosed()
      .subscribe((res) => {
        if(res === 'update') {
        }
      });
  }

  onActionClick(event: any) {
    if(event === 'file-bankmail') {
      this.gotoRecalls();
    }
  }

  gotoRecalls() {
    this.router.navigate(['/bank', 'recall'], {
      queryParamsHandling: 'merge'
    });
  }

  pageChange(value: any) {
    this.pageIndex = +value?.page;
    this.pageSize = +value?.size;
    this.getBankMails();
  }

  protected readonly tableColumns = eptTableColumnsHeaders;
  protected readonly tableActionBtns = BankTableActions;
}
