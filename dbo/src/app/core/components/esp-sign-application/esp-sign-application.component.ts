import {NgClass} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output, signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatOption, MatRipple} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {ToastrService} from 'ngx-toastr';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {ISignerFuncCodes, ISignerMsgTypeCodes} from 'src/app/views/auth/constants/esp-code';

import {UtilsService} from '../../services/utils.service';
import {EspSignConfirmService} from '../../services/esp-confirm.service';
import {MatIcon} from "@angular/material/icon";
import { StyxService } from '../../services/styx.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {TranslateModule} from "@ngx-translate/core";

@Component({
    selector: 'app-esp-sign-application',
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    NgClass,
    MatIcon,
    MatRipple,
    TranslateModule
  ],
    templateUrl: './esp-sign-application.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EspSignApplicationComponent implements OnInit {
  signConfirmForm = this.fb.nonNullable.group({
    espKey: [null as unknown as string, Validators.required],
  });

  directorSign = `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`;
  headOfFinanceSign = `MIIEzAYJKoZIhvcNAQcCoIIEvTCCBLkCAQExEDAOBgoqhlwDDwEDAgEBBQAwEwYJKoZIhvcNAQcBoAYEBGUzMD2gggOTMIIDjzCCAnegAwIBAgIIJ4n1z+KpAVswDQYJKoZIhvcNAQELBQAwFzEVMBMGA1UEAwwMVEVTVC1DQS1DQlJVMB4XDTI1MDMxMTAwMDAwMFoXDTI3MDMxMTA2MTQzOVowgfAxHzAdBgNVBAMMFkFiZHVsbGFqb24gQXhtYWRhbGl5ZXYxGDAWBgNVBAoMD0FsdmEgZ3JvdXAgbGluZTELMAkGA1UEBhMCVVoxGDAWBgNVBAsMD1VaQzAwMDAwMDAwMDExNzEeMBwGCSqGSIb3DQEJARYPZXhhbXBsZUBtYWlsLnJ1MREwDwYDVQQHDAhUYXNoa2VudDEfMB0GA1UEBAwWQWJkdWxsYWpvbiBBeG1hZGFsaXlldjERMA8GA1UECQwIdGFzaGtlbnQxDTALBgcqhlwDEAECDAAxFjAUBgcqhlwDEAEBDAkzMTAyNDc5MTMwYDAZBgkqhlwDDwEBAgEwDAYKKoZcAw8BAQIBAQNDAARAgfJglER5cApDHn+GswMQO0A1TwfYQs/WwEcmD1AFjqe6XP8F1JzkONOv+U9xnlcuMVzQCUBPGiT+lkzYXRRfe6OByDCBxTAUBgNVHSABAf8ECjAIMAYGBFUdIAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwQwHQYDVR0OBBYEFBPqRKEi2aDvNtpaPw5rguKvldmTMB8GA1UdIwQYMBaAFBtoFefVIGUs0vLRT4ZbkMM9962iMB8GA1UdHwQYMBaAFBtoFefVIGUs0vLRT4ZbkMM9962iMCQGCCsGAQUFBwEBBBgwFoAUG2gV59UgZSzS8tFPhluQwz33raIwDgYDVR0PAQH/BAQDAgTwMA0GCSqGSIb3DQEBCwUAA4IBAQA0d/Vg1jowdOCYxVPLQXH6+h78HEKmbOszMIDWBjphcSTSU6Pq2peovFbGKb3NpHHmGwS5DN+o4GMLrSP0I+XGMHxLOcmfzJnIqEPo7tSbqSPBaZ5PLP3lzPvFlUft1cLxUsQqIkvEHcJ6j3GC7BUrx3aipBtR8aX5DIVBd+w1NiWAyiwooLIJGUQIgPI1zZTnHzXJc5+U/CXWFuUKO4CCQzdN+PcxyKQLxHcEwVrduVHOZ9YJmwc4g5xNa/saNnH6B3wQ1flJVJHTUZkwCSGd7BoFjzvjkFtcQozNqCCNeSOqdJfSniWf9fQ6vUgx/pjfiohZ9eZH48DTrYcFmtmVMYH1MIHyAgEBMCMwFzEVMBMGA1UEAwwMVEVTVC1DQS1DQlJVAggnifXP4qkBWzAOBgoqhlwDDwEDAgEBBQCgaTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNTAzMjQxMDIzNTNaMC8GCSqGSIb3DQEJBDEiBCBgToR5ds/dKSboQDeWeD0mhVpRxvEe/o7xdn7v3s2qoDALBgkqhlwDDwEBAgEEQGvW9phdj1Qnts4gTpX13N1PkBOSNsP6e73p40qJDu6/gZUY9GSvi3626zBPLZp5BjdnPSsSqB7QkP+sP70wQcc=`;


  serialNumber = signal('')
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])

  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private espSignConfirmService: EspSignConfirmService,
    private cf: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EspSignApplicationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      additional: string,
      transactionId: number,
      type: string,
      security: any,
      applicationId: any,
      updateMessage: string,
    },
    private styxService: StyxService,
    private destroyRef: DestroyRef,
  ) {
  }

  ngOnInit(): void {
    this.loadEspKeys();
  }

  loadEspKeys() {
    this.styxService.getInfo()
      .then((res1:any)=> {
        if (res1.status) {
          this.styxInfos.set(res1.infos)
          if (res1.infos.length > 0) {
          // this.formModel.patchValue({
          //   clientThumb: res1.infos[0].thumbprint
          // })
          }
          if (window.navigator.platform === 'MacIntel') {
            this.serialNumber.set(res1.infos[0].serialnumber);
            localStorage.setItem('serial_number', this.serialNumber());
          }
        }
        else {
          this.styxInfos.set([]);
          this.toastrService.error(res1.message);
        }
        this.utilsService.spinnerState$$.next(false);
      })
      .catch((error) => {
        this.utilsService.spinnerState$$.next(false);
        this.toastrService.error(error);
      });
  }

  confirm(sign = '') {
    let data: any = {
      applicationId: this.data.applicationId,
    }
    if(this.data.transactionId) {
      data.transactionId = this.data.transactionId;
    }
    const digest = btoa(JSON.stringify(data));
    this.espSignConfirmService.paymentSignApplication({sign, digest})
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res) return
        this.toastrService.success('Подписан!');
        this.utilsService.updateTransactions.next(this.data.updateMessage || 'update');
        this.utilsService.spinnerState$$.next(false);
        this.dialogRef.close('update');
        this.cf.detectChanges();
      },
      error: (err) => {
        this.toastrService.error(err?.message || err);
        this.utilsService.spinnerState$$.next(false);
        this.cf.detectChanges();
      }
    });
  }

  submit() {
    this.signConfirmForm.markAllAsTouched();
    if(this.signConfirmForm.invalid) return;
    this.verifyEsp();
  }

  verifyEsp() {
    const {espKey} = this.signConfirmForm.value;
    this.styxService.getSign({}, espKey,'')
      .then((res2:any)=>{
        if (res2.status){
          // this.utilsService.spinnerState$$.next(true);
          this.confirm(res2.message);
        }
      });
  }

  directorSignConfirm() {
    this.confirm(this.directorSign);
  }

  headOfFinanceSignConfirm() {
    this.confirm(this.headOfFinanceSign);
  }
}
