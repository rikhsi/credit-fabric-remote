import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Inject,
  Output
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {permitUserArray} from "../../models/settings.model";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {DialogRef} from "@angular/cdk/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SettingsService} from "../../services/settings.service";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-delete-permitted-account-dialog',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle,
        MatIcon,
        MatIconButton,
    ],
    templateUrl: './delete-permitted-account-dialog.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeletePermittedAccountDialogComponent implements AfterViewInit{
  @Output() delete = new EventEmitter<void>();
  private _settingsService = inject(SettingsService)
  #destroy = inject(DestroyRef)
  private _cf = inject(ChangeDetectorRef)
  private _utilsService = inject(UtilsService)
  private _toast =inject(ToastrService)
  permittedAccounts:permitUserArray[]=[]
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: number
  ) {
  }
  public _dialogRef = inject(DialogRef<DeletePermittedAccountDialogComponent>)

  getPermittedAccounts(id:number){
    this._utilsService.spinnerState$$.next(true)
    this._settingsService.permitGetAll(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (Array.isArray(res)){
        this.permittedAccounts = res
        this._cf.detectChanges()
      }
    })
  }

  deletePermittedAccounts(id:number){
   if (!id) return
    this._utilsService.spinnerState$$.next(true)
    this._settingsService.deletePermit(id).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res)=>{
      if (!res) return
      this._toast.success(res.msg)
      this.getPermittedAccounts(this.data)
    })
  }
  ngAfterViewInit(): void {
    setTimeout(()=>{
      this.getPermittedAccounts(this.data)
    },0)
  }
}
