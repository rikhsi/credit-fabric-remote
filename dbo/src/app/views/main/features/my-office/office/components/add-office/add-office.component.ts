import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { UiOtpInputComponent } from 'src/app/core/components/ui-otp-input/ui-otp-input.component';

import { OfficeService } from '../../service/office.service';

@Component({
    selector: 'app-add-office',
    imports: [
        MatIcon,
        MatProgressSpinner,
        UiOtpInputComponent,
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        NgClass
    ],
    templateUrl: './add-office.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddOfficeComponent {
  addOfficeForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    officeNumber: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl('')
  })
  isLoading: boolean = false

  constructor(
    public _dialogRef: MatDialogRef<AddOfficeComponent>,
    private _office: OfficeService,
    private _toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, uuid: string, name: string },
  ) {
    if (data.type === 'edit')
      this.addOfficeForm.patchValue({
        name: this.data.name ? this.data.name : ''
      })
  }

  formSubmit() {
    this.isLoading = true
    if (this.addOfficeForm.valid) {
      if (this.data.type === 'create' && this.data.uuid === null) {
        this._office.addOffice(this.addOfficeForm.value).subscribe({
          next: (res) => {
            if (res.success) {
              this._dialogRef.close('success')
              this._toast.success(res.result.message)
            } else {
              this._toast.error(res.result.message)
            }
          },
          error: (err) => (console.log(err)),
          complete: () => {
            this.isLoading = false
          }
        })
      } else {
        this._office.editOffice({
          name:this.addOfficeForm.value.name,
          street:this.addOfficeForm.value.street,
          officeNumber:this.addOfficeForm.value.officeNumber,
          city:this.addOfficeForm.value.city,
          uuid:this.data.uuid
        }).subscribe({
          next: (res) => {
            if (res.success) {
              this._dialogRef.close('success')
              this._toast.success(res.result.message)
            } else {
              this._toast.error(res.result.message)
            }
          },
          error: (err) => (console.log(err)),
          complete: () => {
            this.isLoading = false
          }
        })
      }
    }
  }
}
