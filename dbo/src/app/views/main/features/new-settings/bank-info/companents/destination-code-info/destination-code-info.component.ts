import {Component, DestroyRef, inject, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {catchError, debounceTime, EMPTY, switchMap, take, tap} from "rxjs";
import {FormControl, FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";

import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import mustache from "mustache";
import {MatPaginator} from "@angular/material/paginator";
import {PaginationComponent} from "../../../../../../../shared/components/pagination/pagination.component";
import {NewPaginationComponent} from "../../../../../../../shared/components/new-pagination/new-pagination.component";
import {AuthService} from "../../../../../../auth/services/auth.service";
import {NewSettingsService} from "../../../services/new-settings.service";
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_PAGE_SIZE } from "src/app/constants";
import { UtilsService } from "src/app/core/services/utils.service";
import {MatIcon} from "@angular/material/icon";
import {EmptyStateComponent} from "../../../../../../../shared/components/empty-state/empty-state.component";


@Component({
  selector: "app-destination-code-info",
  templateUrl: "./destination-code-info.component.html",
  styleUrls: ["./destination-code-info.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    NgClass,
    PaginationComponent,
    ReactiveFormsModule,
    NewPaginationComponent,
    TranslateModule,
    MatIcon,
    EmptyStateComponent
  ]
})

export class DestinationCodeInfoComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  selected = false
  editing =false;
  search = new FormControl('');
  #destroy = inject(DestroyRef)
  bankInfoItemsWithCode = signal<any>([]);
  totalItems = signal<number>(0)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(DEFAULT_PAGE_SIZE)
  isLoading = signal<boolean>(false)

  constructor(
    public router: Router,
    private newSettingsService: NewSettingsService,
    private utilsService:UtilsService
  ) {

  }
  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.#destroy),
      switchMap((value:any) => {
      const searchValue = value?.toLowerCase() ?? '';
      this.pageSize.set(this.pageSize())
      this.pageIndex.set(0)
      this.totalItems.set(0)
      this.isLoading.set(true);
     return  this.loadBankInfoWithCode()
      })
    ).subscribe();
  this.isLoading.set(true);
    this.loadBankInfoWithCode().subscribe()

  }


   handlePinAndUnpin(data:any){
    console.log(data)
      this.utilsService.spinnerState$$.next(true)
        let observer$ = data.isPinned ? this.newSettingsService.unpinAccountTransactionPurpose(data.code) : this.newSettingsService.pinAccountTransactionPurpose(data.code)
        observer$.pipe(
          switchMap((res) => {
           this.utilsService.spinnerState$$.next(false)
            if(res) {
              return this.loadBankInfoWithCode()
            }
            return EMPTY;
          })
        ).subscribe()
    }

  reloadBankInfoWithCode(){
    this.isLoading.set(true);
    this.loadBankInfoWithCode().subscribe();
  }
  loadBankInfoWithCode() {

  return  this.newSettingsService.destinationCodes(
      {
        page: this.pageIndex() || 0,
        size: this.pageSize() || DEFAULT_PAGE_SIZE,
        searchText: this.search.value || '',
      }
    )
      .pipe(
        take(1),
        tap((res) => {
       console.log(555100, res?.result?.data?.pageable.pageSize)
          this.pageSize.set(res?.result?.data?.pageable.pageSize || DEFAULT_PAGE_SIZE)
          this.pageIndex.set(res?.result?.data?.pageable.pageNumber || 0)
          this.totalItems.set(res?.result?.data?.totalElements || 0)
          this.bankInfoItemsWithCode.set(res?.result?.data?.content || []);
          this.isLoading.set(false);
      }),
      catchError((err) => {
    this.isLoading.set(false);
          this.bankInfoItemsWithCode.set([])
          return EMPTY;
      })
  )
  }


}
