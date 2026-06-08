import { Component, inject, signal } from '@angular/core';
import {FormBuilder, Validators, AbstractControl, ReactiveFormsModule, FormControl} from '@angular/forms';
import {MatDialog, MatDialogClose} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import {CommonModule, NgClass} from "@angular/common";
import { MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {NewSettingsService} from "../../../services/new-settings.service";
import {catchError, EMPTY, take} from "rxjs";
import {Router} from "@angular/router";
import {SettingsAuthMyIdComponent} from "../../myId/settings-auth-myId..component";
import {SmsCodeDialogComponent} from "../sms-code-dialog/sms-code-dialog.component";
import { TranslateModule } from '@ngx-translate/core';
import {RsaOaepService} from "../../../../../../../shared/services/rsa-oaep.service";

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatDialogClose,
    TranslateModule,
  ]
})
export class ChangePasswordDialogComponent {
  protected readonly router = inject(Router);

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  hidePasswordCurrent = signal(true);
  hidePassword = signal(true);
  hideConfirm = signal(true);
  encryptKey = signal('');
  changeStep = signal(1)
  currentPassword = signal("")
  passwordError = signal(false);
  attemptsLeft = signal(5);

  form = this.fb.group({
    newPasswordItem: ['', [Validators.required, Validators.minLength(12), this.passwordStrengthValidator]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  constructor(
    private newSettingsService: NewSettingsService,
    private matDialog: MatDialog,
    private rsaService: RsaOaepService,
  ) {
  }

  get newPasswordCtrl(): AbstractControl { return this.form.get('newPasswordItem')!; }
  get confirmPasswordCtrl(): AbstractControl { return this.form.get('confirmPassword')!; }

  passwordStrengthValidator(control: AbstractControl) {
    const value = control.value || '';
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const valid = value.length >= 12 && hasUpper && hasDigit && hasSpecial;
    return valid ? null : { weak: true };
  }

  passwordMatchValidator(group: AbstractControl) {

    const pass = group.get('newPasswordItem');
    const confirm = group.get('confirmPassword');
    if (confirm && pass &&  pass.value !== confirm.value) {
      return  { notMatch: true };
    } else {
      if (confirm?.hasError('notMatch')) {
        confirm.setErrors(null);
      }
    }
    return null;
  }

  getStrengthLevel() {
    const value = this.newPasswordCtrl.value || '';
    let score = 0;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++;
    if (value.length >= 12) score++;
    return score;
  }

  submit() {
    const confirmPassword = this.form.get('confirmPassword')?.value
    const password = this.form.get('newPasswordItem')?.value
    const valuesToEncrypt = {
      password: password as string,
      confirmPassword: confirmPassword as string
    };
    if (!this.form.invalid && confirmPassword && password ) {
      // this.toastr.error('Пароль некорректный');
      this.rsaService.encryptValues(
        valuesToEncrypt,
        this.encryptKey()
      ).then((encValues: any) => {
        this.newSettingsService.changeUserPassword({encPassword: encValues.password, encConfirmPassword: encValues.confirmPassword})
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (res?.success) {

                // this.router.navigate(['/new-auth/my-id'], { queryParams: { sessionId: res.sessionId, identityToken: res.identityToken } })
                //  this.addQuery(res)
                this.openSmsCodeDialog(res)
              } else {
                this.toastr.error( res.result.message || "Что-то пошло не так!");
              }
            },
            error: (err) => {
              console.log("ERROR", err);
            }
          });
      })
    }
    console.log("submit, ",this.form.invalid )
    // this.dialogRef.close(true);
  }
  hasUpperCase(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /[A-Z]/.test(value);
  }

  hasNumber(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /\d/.test(value);
  }

  hasSpecialChar(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(value);
  }

  hasMinLength(): boolean {
    const value = this.newPasswordCtrl.value || '';
    return value.length >= 12;
  }

  addQuery(item: any) {
    if (!item?.result?.data?.sessionId){
      this.matDialog.closeAll();
      this.toastr.error("Произошла ошибка.");
      return;
    } else {
      this.router.navigate([], {
        relativeTo: undefined,
        queryParams: { sessionId: item?.result?.data?.sessionId, type: 'passwordChange' },
        queryParamsHandling: 'merge'
      });
      this.openMyIdDialog(item)
    }

  }
  openMyIdDialog(item:any): void {
    this.matDialog.closeAll();
    this.matDialog.open(SettingsAuthMyIdComponent, {
      data: {requestId: item?.result?.data?.requestId, },
      width: '540px',
    })
  }
  checkPassword(){
    if (this.currentPassword()) {
      this.newSettingsService.checkUserPassword({currentPassword: this.currentPassword() })
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            console.log(555, res)
            if (res?.success) {
              this.passwordError.set(false);
              this.encryptKey.set(res.result?.data?.encryptKey);
              this.changeStep.set(2)
            } else {
              this.attemptsLeft.update(v => Math.max(0, v - 1));
              this.passwordError.set(true);
              this.toastr.error( res.result.message || "Что-то пошло не так!");
            }
          },
          error: (err) => {
            this.attemptsLeft.update(v => Math.max(0, v - 1));
            this.passwordError.set(true);
            this.toastr.error( err.message || "Что-то пошло не так!");
            console.log("ERROR", err);
          }
        });
    }
  }

  openSmsCodeDialog(item): void {
    if (!item?.result?.data?.sessionId) return
    const userInfo = localStorage.getItem("user") ||  null;
    const phoneNumber  = userInfo ? JSON.parse(userInfo)?.username : null;
    this.matDialog.closeAll();
    this.matDialog.open(SmsCodeDialogComponent, {
      data: {newPhoneNumber: phoneNumber? phoneNumber.slice(3) : "", requestId:  item?.result?.data?.requestId, sessionId: item?.result?.data?.sessionId, type: "passwordChange"},
      width: '540px',

      panelClass: 'custom-block-dialog'
    })
  }
}
