import {Component, DestroyRef, inject, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {debounceTime, take} from "rxjs";
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

@Component({
  selector: "app-purpose-transfer-info",
  templateUrl: "./purpose-transfer-info.component.html",
  styleUrls: ["./purpose-transfer-info.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    NgClass,
    PaginationComponent,
    ReactiveFormsModule,
    NewPaginationComponent,
    TranslateModule
  ]
})

export class PurposeTransferComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  selected = false
  editing =false;
  search = new FormControl('');
  #destroy = inject(DestroyRef)
  treasuryAccountsList = signal<any>([]);
  totalItems = signal<number>(0)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(DEFAULT_PAGE_SIZE)
  isLoading = signal<boolean>(false)

  constructor(
    public router: Router,
    private newSettingsService: NewSettingsService,

  ) {

  }
  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.#destroy)
    ).subscribe(value => {
      const searchValue = value?.toLowerCase() ?? '';
      this.pageSize.set(DEFAULT_PAGE_SIZE)
      this.pageIndex.set(0)
      this.totalItems.set(0)
      this.loadPurposeTransfer()

    });
    this.loadPurposeTransfer()

  }
  loadPurposeTransfer() {
    this.isLoading.set(true);
    this.newSettingsService.purposeTransfer(
      {
        page: this.pageIndex(),
        size: this.pageSize(),
        search: this.search.value || '',
        referenceId: 29,
      }
    )
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.pageSize.set(res?.result?.data?.pageable?.pageSize || DEFAULT_PAGE_SIZE)
          this.pageIndex.set(res?.result?.data?.pageable?.pageNumber || 0)
          this.totalItems.set(res?.result?.data?.totalElements || 0)
          this.treasuryAccountsList.set(res?.result?.data?.purposes || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.treasuryAccountsList.set([])
        }
      });
  }


}
