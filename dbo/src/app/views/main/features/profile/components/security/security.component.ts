import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { NgClass, NgIf } from "@angular/common";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatDialog} from "@angular/material/dialog";
import {EspSignConfirmComponent} from "../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";

@Component({
    selector: 'app-security',
    imports: [
        ReactiveFormsModule,
        TranslateModule,
        UiSvgIconComponent,
        NgClass,
        NgIf
    ],
    templateUrl: './security.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityComponent implements OnInit {

  oldPasswordShow = false
  newPasswordShow = false
  changePasswordForm: FormGroup = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', Validators.required)
  })
constructor(private matDialog:MatDialog) {
}
  formSubmit() {
    if (this.changePasswordForm.valid) {
      this.matDialog.open(EspSignConfirmComponent,{
        width:'500px',
        data:{
          action: {
            type:'security',
            security:this.changePasswordForm.value
          },
          transaction: {}
        }
      })
    }
  }

  passwordMatchValidator(oldPasswordControl: AbstractControl): ValidatorFn {
    return (newPasswordControl: AbstractControl): ValidationErrors | null => {
      if (!oldPasswordControl || !newPasswordControl) {
        return null;
      }
      const oldPassword = oldPasswordControl.value;
      const newPassword = newPasswordControl.value;
      if (oldPassword === newPassword) {
        return {'passwordMatch': true};
      }
      return null
    }
  }

  get oldPassword(): AbstractControl {
    return this.changePasswordForm.get('oldPassword') as AbstractControl
  }

  get newPassword(): AbstractControl {
    return this.changePasswordForm.get('newPassword') as AbstractControl
  }

  ngOnInit() {
    this.changePasswordForm.get('newPassword')?.setValidators(
      this.passwordMatchValidator(this.changePasswordForm.get('oldPassword') as AbstractControl)
    );

    // Re-run validation
    this.changePasswordForm.get('newPassword')?.updateValueAndValidity();
  }
}
