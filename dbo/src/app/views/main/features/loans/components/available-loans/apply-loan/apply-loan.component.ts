import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject, OnDestroy,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatRippleModule} from '@angular/material/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgxMaskDirective, NgxMaskPipe} from 'ngx-mask';
import {LoanService} from '../../../services/loan.service';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatIcon} from '@angular/material/icon';
import {DialogRef} from '@angular/cdk/dialog';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {LoanDto} from "../../../models/loan.model";
import {Subject, takeUntil} from "rxjs";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";
import {MatError} from "@angular/material/form-field";


@Component({
    selector: 'app-apply-loan',
    imports: [
        CommonModule,
        MatRippleModule,
        FormsModule,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatIcon,
        NgxMaskPipe,
        MatError,
    ],
    templateUrl: './apply-loan.component.html',
    styles: [
        `
      :host {
        display: block;
        max-width: 792px;

        /* range-slider.component.css */
        .range-slider {
          position: relative;
        }

        .custom-range {
          /* Add your custom styles for the range input */
          width: 100%;
          height: 10px;
          background-color: #e0e0e0;
          border: none;
          border-radius: 5px;
          outline: none;
          -webkit-appearance: none;
        }

        .custom-range::-webkit-slider-thumb {
          /* Add your custom styles for the slider thumb */
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: #7c8897;
          border-radius: 50%;
          cursor: pointer;
        }

        .indicator {
          position: absolute;
          bottom: 20px;
          transform: translateX(-50%);
          background-color: #7c8897;
          color: white;
          padding: 6px 10px;
          border-radius: 5px;
        }

        select {
          -webkit-appearance: none;
          appearance: none;
        }
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplyLoanComponent {
  // private unsub$ = new Subject<void>();
  // step: number = 1
  // photo:boolean = true
  // applyCreditForm = this.fb.group({
  //   id: new FormControl(this.data.id, Validators.required),
  //   amount: new FormControl(this.data.minAmount / 100, Validators.compose([Validators.required, Validators.min(this.data.minAmount / 100), Validators.max(this.data.maxAmount / 100)])),
  //   period: new FormControl(1, Validators.compose([Validators.required, Validators.max(this.data.loanPeriod), Validators.min(1)])),
  //   currency: new FormControl(this.data.loanCurrency)
  // });
  // photoForm: FormGroup = new FormGroup({
  //   photo_from_camera: new FormControl('', Validators.required)
  // })
  //
  // get amount(): FormControl {
  //   return this.applyCreditForm.get('amount') as FormControl
  // }
  //
  // get period(): FormControl {
  //   return this.applyCreditForm.get('period') as FormControl
  // }
  //
  // constructor(
  //   private cf: ChangeDetectorRef,
  //   private fb: FormBuilder,
  //   public dialogRef: DialogRef,
  //   @Inject(MAT_DIALOG_DATA) public data: LoanDto,
  //   private _loanService: LoanService,
  //   private utilsService: UtilsService,
  //   private _toast: ToastrService
  // ) {
  //
  // }
  //
  // formSubmit() {
  //   if (this.applyCreditForm.valid) {
  //     this.step = 2
  //     window?.addEventListener('message', (e) => {
  //       const data: any = e.data
  //       console.log(e)
  //       const iframe: any = document.getElementById('myid_iframe');
  //       if (data.state_message === 'loaded' && data.cmd === -1) {
  //         iframe.contentWindow.postMessage({cmd: 'open', config: {locale: 'ru'}}, '*');
  //       } else if (e.data.cmd === 2) {
  //         this.photoForm.patchValue({
  //           photo_from_camera: e.data.photo_from_camera
  //         })
  //         setTimeout(()=>{
  //           iframe.contentWindow.postMessage({cmd: 'close'}, '*');
  //           this.photo = false
  //           this.cf.detectChanges()
  //         },5000)
  //         this.cf.detectChanges()
  //       }
  //     });
  //   } else {
  //     this.step = 2
  //   }
  //
  // }
  //
  // creteLoan() {
  //   if (this.applyCreditForm.valid && this.photoForm.valid) {
  //     this.utilsService.spinnerState$$.next(true)
  //     const amount = this.amount.value * 100
  //     this._loanService.requestToLoanApplication({
  //       id: this.applyCreditForm.value.id,
  //       period: this.applyCreditForm.value.period,
  //       amount: amount,
  //       currency: this.applyCreditForm.value.currency,
  //       identityPhoto:this.photoForm.value.photo_from_camera
  //
  //     }).pipe(takeUntil(this.unsub$)).subscribe((res) => {
  //       if (res.msg) {
  //         this._toast.success(res.msg)
  //         this.dialogRef.close()
  //       } else {
  //         this._toast.success(res.msg ? res.msg : res.message)
  //       }
  //       this.cf.detectChanges()
  //     })
  //   }
  // }
  // closeDialog(){
  //   this.photo = false
  //   this.dialogRef.close()
  //   this.cf.detectChanges()
  // }
  //
  // ngOnDestroy() {
  //   this.unsub$.next()
  //   this.unsub$.complete()
  // }
}
