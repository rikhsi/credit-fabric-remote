import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SettingsService} from "../../services/settings.service";
import {UsersContent} from "../../models/settings.model";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {MatRipple} from "@angular/material/core";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatDialog} from "@angular/material/dialog";
import {AttachAccountDialogComponent} from "../attach-account-dialog/attach-account-dialog.component";
import {
  DeletePermittedAccountDialogComponent
} from "../delete-permitted-account-dialog/delete-permitted-account-dialog.component";

@Component({
    selector: 'app-attach-user',
    imports: [
        MatIcon,
        MatMenu,
        MatPaginator,
        MatRipple,
        UiSvgIconComponent,
        MatMenuTrigger
    ],
    templateUrl: './attach-user.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachUserComponent implements OnInit {
  usersList: UsersContent[] = []
  pageSize = 0;
  pageIndex = 0;
  @ViewChild('paginator') paginator!: MatPaginator;
  #destroy = inject(DestroyRef)
  private _settingsService = inject(SettingsService)
  private _cf = inject(ChangeDetectorRef)
  private _utilsService = inject(UtilsService)
  private _matDialog = inject(MatDialog)


  getUsersList(paging = {page: 0, size: 10}) {
    this.usersList = []
    this._settingsService.getUsers(paging).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
      if (!res) return
      this.pageSize = paging.size;
      this.paginator.pageIndex = this.pageIndex;
      this.paginator.length = res.totalElements;
      this.usersList = res.content
      this._cf.detectChanges()
    })
  }

  pageChanged(event: PageEvent) {
    this._utilsService.spinnerState$$.next(true);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    let page = event.pageIndex;
    let size = event.pageSize;
    this.getUsersList({page: page, size: size})
  }

  attachAccountDialog(id: number) {
    if (id) {
      this._settingsService.permitGetAll(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (Array.isArray(res)){
          const dialogRef = this._matDialog.open(AttachAccountDialogComponent, {
            width: '600px',
            data:{
              id:id,
              accounts:res
            }
          })
          dialogRef.componentInstance.add.subscribe(() => {
            dialogRef.close()
            this.getUsersList()
          })
        }
      })

    }
  }
  deletePermittedAccounts(id: number) {
    if (id) {
          const dialogRef = this._matDialog.open(DeletePermittedAccountDialogComponent, {
            width: '600px',
            data:id
          })
          dialogRef.componentInstance.delete.subscribe(() => {
            dialogRef.close()
            this.getUsersList()
          })



    }
  }

  ngOnInit(): void {
    this.getUsersList()
  }

}
