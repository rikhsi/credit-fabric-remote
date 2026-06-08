import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {NgxMaskPipe} from "ngx-mask";
import {UiSvgIconComponent} from "../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {PassiveUsersService} from "./services/passive-users.service";
import {UtilsService} from "../../../../core/services/utils.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {PassiveUserContent} from "./models/passive-users.model";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {takeUntil} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {MatIcon} from "@angular/material/icon";
import {MatRipple} from "@angular/material/core";
import {RouterLinkActive} from "@angular/router";
import {AddPassiveUserComponent} from "./components/add-passive-user/add-passive-user.component";

@Component({
    selector: 'app-passive-users',
    imports: [
        MatMenu,
        MatPaginator,
        NgxMaskPipe,
        UiSvgIconComponent,
        MatMenuTrigger,
        MatIcon,
        MatRipple,
        RouterLinkActive
    ],
    templateUrl: './passive-users.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassiveUsersComponent implements OnInit {
  usersList:PassiveUserContent[]=[]
  pageSize = 0;
  pageIndex = 0;
  @ViewChild('paginator') paginator!: MatPaginator;
  #destroy = inject(DestroyRef)
  private _passiveUsersService = inject(PassiveUsersService)
  private _cf = inject(ChangeDetectorRef)
  private _utilsService = inject(UtilsService)
  private _matDialog = inject(MatDialog)
  private _toast = inject(ToastrService)



  pUsersAddDialog(){
  const dialogRef = this._matDialog.open(AddPassiveUserComponent,{
     width:'600px'
   })
    dialogRef.componentInstance.add.subscribe(() => {
      dialogRef.close()
      this.getPassiveUserList()
    })
  }
  getPassiveUserList(paging = {page: 0, size: 10}) {
    this.usersList = []
    this._passiveUsersService.getPassiveUsers(paging).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
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
    this.getPassiveUserList({page: page, size: size})
  }

  deletePassiveUser(id:string) {
    if (id) {
      const dialog = this._matDialog.open(AgreeDialogComponent, {
        data: {title: 'Вы точно хотите удалить'},
      })
      dialog.afterClosed().pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (res === 'success') this.delete(id)
      })
    }
  }
  delete(id:string){
    this._utilsService.spinnerState$$.next(true)
    this._passiveUsersService.deletePassiveUser(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res)=>{
      if (!res) return
      this._toast.success(res.msg)
      this.getPassiveUserList()
    })
  }
  ngOnInit(): void {
    this.getPassiveUserList()
  }
}
