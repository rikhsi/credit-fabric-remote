import {ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Output} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NgxMaskDirective} from "ngx-mask";
import {NgClass} from "@angular/common";
import {PassiveUsersService} from "../../services/passive-users.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../core/services/utils.service";

@Component({
    selector: 'app-add-passive-user',
    imports: [
        MatIcon,
        ReactiveFormsModule,
        UiSvgIconComponent,
        NgxMaskDirective,
        NgClass
    ],
    templateUrl: './add-passive-user.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPassiveUserComponent {
  @Output() add = new EventEmitter<void>();
  public _dialogRef = inject(MatDialogRef<AddPassiveUserComponent>)
  private _passiveUserService = inject(PassiveUsersService)
  private _toast = inject(ToastrService)
  private _utilsService = inject(UtilsService)
  #destroy = inject(DestroyRef)
  isPasswordShown = false
  addForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
  })

  formSubmit() {
    if (this.addForm.valid) {
      this._utilsService.spinnerState$$.next(true)
      let row = this.addForm.get('phoneNumber')
      const phoneNumber = row?.value?.replaceAll(' ','')
      this._passiveUserService
        .createPassiveUser({
          phoneNumber:phoneNumber,
          name:this.addForm.value.name,
          surname:this.addForm.value.surname,
          password:this.addForm.value.password
        })
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe((res) => {
        if (!res) return
        this._toast.success(res.msg)
        this.add.emit()
      })
    }
  }
}
