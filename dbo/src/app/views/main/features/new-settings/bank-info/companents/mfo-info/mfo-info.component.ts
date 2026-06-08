import { UtilsService } from './../../../../../../../core/services/utils.service';
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
import {MatIconModule} from "@angular/material/icon";
import {EmptyStateComponent} from "../../../../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: "app-mfo-info",
  templateUrl: "./mfo-info.component.html",
  styleUrls: ["./mfo-info.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    NgClass,
    PaginationComponent,
    ReactiveFormsModule,
    NewPaginationComponent,
    TranslateModule,
    MatIconModule,
    EmptyStateComponent
  ]
})

export class MfoInfoComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  selected = false
  editing =false;
  search = new FormControl('');
  #destroy = inject(DestroyRef)
  bankInfoItems = signal<any>([]);
  totalItems = signal<number>(0)
  activeTabIndex = signal<number>(1)
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
      switchMap((value) => {
        const searchValue = value?.toLowerCase() ?? '';
        this.pageSize.set(this.pageSize())
        this.pageIndex.set(0)
        this.totalItems.set(0)
        this.isLoading.set(true);
        return this.loadBankInfo()
      })
    ).subscribe();

    this.reloadBankInfo();
  }

  reloadBankInfo(): void {
    this.isLoading.set(true);
    this.loadBankInfo().subscribe();
  }

  handlePinAndUnpin(data:any){
    this.utilsService.spinnerState$$.next(true)
      let observer$ = data.isPinned ? this.newSettingsService.unpinAccountBankInfo(data.id) : this.newSettingsService.pinAccountBankInfo(data.id)
      observer$.pipe(
        switchMap((res) => {
         this.utilsService.spinnerState$$.next(false)
          if(res) {
            return this.loadBankInfo()
          }
          return EMPTY;
        })
      ).subscribe()
  }

  loadBankInfo() {
    return this.newSettingsService.getBankInfo(
      {
        page: this.pageIndex(),
        size: this.pageSize(),
        search: this.search?.value || "",
      }
    )
      .pipe(
        take(1),
        tap((res) => {
          this.pageSize.set(res?.result?.data?.size || DEFAULT_PAGE_SIZE)
          this.pageIndex.set(res?.result?.data?.number || 0)
          this.totalItems.set(res?.result?.data?.totalElements || 0)
          this.bankInfoItems.set(res?.result?.data?.content || []);
          this.isLoading.set(false);
        }),
        catchError((err) => {
          this.isLoading.set(false);
          this.bankInfoItems.set([])
          return EMPTY
        })
      )
  }

}
