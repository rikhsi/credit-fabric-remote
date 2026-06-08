import {DecimalPipe, NgClass, NgIf} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef, inject,
  Inject,
  OnInit,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatOption, MatRipple} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {ToastrService} from 'ngx-toastr';
import {UtilsService} from '../../services/utils.service';
import {EspSignConfirmService} from '../../services/esp-confirm.service';
import {MatIcon} from "@angular/material/icon";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StyxService} from '../../services/styx.service';
import {AuthService} from "../../../views/auth/services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NewSettingsService} from "../../../views/main/features/new-settings/services/new-settings.service";
import {Subject, take, takeUntil} from "rxjs";
import {
  SettingsSuccessModal
} from "../../../views/main/features/new-settings/components/settings-dialogs/settings-success-modal/settings-success-modal";
import {SuccessModalComponent} from "../../../shared/components/success-modal/success-modal";
import {FirebaseAnalyticsService} from "../../../../../firebase-analytics.service";
import {
  SigningDialogComponent
} from "../../../views/main/features/new-settings/components/settings-dialogs/signing-dialog/signing-dialog.component";
import { AUTH_SMS_STEP } from 'src/app/constants';
import { getAuthFlowId } from '../../utils';

@Component({
  selector: 'app-esp-sign-confirm',
  imports: [
    MatFormField,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    DecimalPipe,
    NgIf,
    TranslateModule
  ],
  templateUrl: './esp-sign-confirm.component.html',
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EspSignConfirmComponent implements OnInit {
  signConfirmForm = this.fb.nonNullable.group({
    espKey: [null as unknown as string, Validators.required],
  });

  directorSign = `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`;
  headOfFinanceSign = `MIIEzAYJKoZIhvcNAQcCoIIEvTCCBLkCAQExEDAOBgoqhlwDDwEDAgEBBQAwEwYJKoZIhvcNAQcBoAYEBGUzMD2gggOTMIIDjzCCAnegAwIBAgIIJ4n1z+KpAVswDQYJKoZIhvcNAQELBQAwFzEVMBMGA1UEAwwMVEVTVC1DQS1DQlJVMB4XDTI1MDMxMTAwMDAwMFoXDTI3MDMxMTA2MTQzOVowgfAxHzAdBgNVBAMMFkFiZHVsbGFqb24gQXhtYWRhbGl5ZXYxGDAWBgNVBAoMD0FsdmEgZ3JvdXAgbGluZTELMAkGA1UEBhMCVVoxGDAWBgNVBAsMD1VaQzAwMDAwMDAwMDExNzEeMBwGCSqGSIb3DQEJARYPZXhhbXBsZUBtYWlsLnJ1MREwDwYDVQQHDAhUYXNoa2VudDEfMB0GA1UEBAwWQWJkdWxsYWpvbiBBeG1hZGFsaXlldjERMA8GA1UECQwIdGFzaGtlbnQxDTALBgcqhlwDEAECDAAxFjAUBgcqhlwDEAEBDAkzMTAyNDc5MTMwYDAZBgkqhlwDDwEBAgEwDAYKKoZcAw8BAQIBAQNDAARAgfJglER5cApDHn+GswMQO0A1TwfYQs/WwEcmD1AFjqe6XP8F1JzkONOv+U9xnlcuMVzQCUBPGiT+lkzYXRRfe6OByDCBxTAUBgNVHSABAf8ECjAIMAYGBFUdIAAwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwQwHQYDVR0OBBYEFBPqRKEi2aDvNtpaPw5rguKvldmTMB8GA1UdIwQYMBaAFBtoFefVIGUs0vLRT4ZbkMM9962iMB8GA1UdHwQYMBaAFBtoFefVIGUs0vLRT4ZbkMM9962iMCQGCCsGAQUFBwEBBBgwFoAUG2gV59UgZSzS8tFPhluQwz33raIwDgYDVR0PAQH/BAQDAgTwMA0GCSqGSIb3DQEBCwUAA4IBAQA0d/Vg1jowdOCYxVPLQXH6+h78HEKmbOszMIDWBjphcSTSU6Pq2peovFbGKb3NpHHmGwS5DN+o4GMLrSP0I+XGMHxLOcmfzJnIqEPo7tSbqSPBaZ5PLP3lzPvFlUft1cLxUsQqIkvEHcJ6j3GC7BUrx3aipBtR8aX5DIVBd+w1NiWAyiwooLIJGUQIgPI1zZTnHzXJc5+U/CXWFuUKO4CCQzdN+PcxyKQLxHcEwVrduVHOZ9YJmwc4g5xNa/saNnH6B3wQ1flJVJHTUZkwCSGd7BoFjzvjkFtcQozNqCCNeSOqdJfSniWf9fQ6vUgx/pjfiohZ9eZH48DTrYcFmtmVMYH1MIHyAgEBMCMwFzEVMBMGA1UEAwwMVEVTVC1DQS1DQlJVAggnifXP4qkBWzAOBgoqhlwDDwEDAgEBBQCgaTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yNTAzMjQxMDIzNTNaMC8GCSqGSIb3DQEJBDEiBCBgToR5ds/dKSboQDeWeD0mhVpRxvEe/o7xdn7v3s2qoDALBgkqhlwDDwEBAgEEQGvW9phdj1Qnts4gTpX13N1PkBOSNsP6e73p40qJDu6/gZUY9GSvi3626zBPLZp5BjdnPSsSqB7QkP+sP70wQcc=`;

  serialNumber = signal('')
  isVirtual = signal<string>('')
  unsub$ = new Subject<void>();
  styxInfos = signal<Array<{
    company: string,
    fio: string,
    serialnumber: string,
    thumbprint: string,
    tokenSN: string,
    notafter: string,
    notbefore: string
  }>>([])
  remainingSeconds = signal(0);
  private translateService = inject(TranslateService)
  countdownInterval: any;
  mode = signal<string>('')
  constructor(
    private fb: FormBuilder,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    private espSignConfirmService: EspSignConfirmService,
    private cf: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EspSignConfirmComponent>,
    private newSettingsService: NewSettingsService,
    private analyticsService: FirebaseAnalyticsService,
    @Inject(MAT_DIALOG_DATA) public data: {
      pinfl: string
      action: {
        additional: string,
        externalId: string,
        type: string,
        from?: string,
        security: any,
        isAuth: boolean,
        isVirtual: boolean,
        identityToken: string,
        successMessage: string,
        action: string,
        isApplication: boolean,
        transactionId: number,
        applicationId: number,
        transactionSignActionDtos: any[],
        applicationDetails: any[],
        actionType?: string
        body?: any,
        isMassivePayment:boolean,
        massivePaymentData?:any
      }
      transaction: any;
      from?: string
    },
    private styxService: StyxService,
    private espConfirmServiceEspConfirmService: EspSignConfirmService,
    private destroyRef: DestroyRef,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
       let modeValue = this.activatedRoute.snapshot.queryParams['mode']
    this.mode.set(modeValue)
    this.startSignEvent()
    if (!this.data.pinfl) {
      this.getPinfl()
    }
    if (this.data.action.isAuth) {
      this.checkEtspCanAuth()
    } else {
      this.checkEtspCanSign()
    }
    this.loadEspKeys();



     if (this.data.action.isAuth) {
    this.analyticsService.logFirebaseCustomEvent(
      'authorization_virtual_electronic_signature_button_enter', null
    );
  }


  }
 startSignEvent(): void {
   this.analyticsService.logFirebaseCustomEvent('sign_start', {platform: "web", signature_type: this.isVirtual() ? "VIRTUAL" : "PHYSICAL"});

 }
  private getPinfl() {
    this.espSignConfirmService.getPinflForStyx().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.result.pinfl) this.data.pinfl = res.result.pinfl
      },
      error: (error) => {
        this.toastrService.error(error.message ? error.message : error.errorMessage);
      }
    })
  }

  openOtherSignModal() {
    this.dialogRef.close();
    this.dialog.open(SigningDialogComponent, {
      data: this.data.action,
      width: '540px',
    });

  }


  private isVirtualToken(tokenSN: string | null | undefined): boolean {
    if (!tokenSN) return false;
    return tokenSN.toLowerCase().includes('virtual');
  }

  private filterInfosByPriority(infos: any[]): any[] {
    if (!Array.isArray(infos) || infos.length === 0) {
      return [];
    }
    const physicalInfos = infos.filter(i => !this.isVirtualToken(i.tokenSN));
    const virtualInfos = infos.filter(i => this.isVirtualToken(i.tokenSN));
    if (physicalInfos.length > 0) {
      return physicalInfos;
    }
    return virtualInfos;
  }


  loadEspKeys() {
    this.styxService.getInfo()
      .then((res1: any) => {
        if (res1.status) {

          const filteredToPinfl = res1.infos.filter(i => i.PINFL === this.data.pinfl)
          if (filteredToPinfl.length === 0) {
            this.styxInfos.set([]);
            this.toastrService.error(this.translateService.instant('new.not_match_pinfl'));
            return;
          }
          const filteredInfos = this.filterInfosByPriority(filteredToPinfl || []);

          this.styxInfos.set(filteredInfos);

          if (filteredInfos.length > 0) {
            // this.formModel.patchValue({
            //   clientThumb: filteredInfos[0].thumbprint
            // })
          }

          if (window.navigator.platform === 'MacIntel' && filteredInfos.length > 0) {
            this.serialNumber.set(filteredInfos[0].serialnumber);
            localStorage.setItem('serial_number', this.serialNumber());
          }
          const certificates = this.mapToCertificates(filteredInfos);
          if (certificates.length) {
            this.espConfirmServiceEspConfirmService.styxSaveList({
              certificates: certificates,
              identityToken: this.data.action.identityToken ? this.data.action.identityToken : null
            }).subscribe({
              next: res => {
              },
              error: err => {
                this.toastrService.error(err.message || err);
              }
            });
          }

        } else {
          this.styxInfos.set([]);
          this.toastrService.error(res1.message);
        }
      })
      .catch((error) => {
        this.toastrService.error(error);
      });

  }

  private mapToCertificates(infos: any[]) {
    return infos
      .filter(i => i && i.serialnumber)
      .map(i => ({
        certificate: i.serialnumber,
        type:
          i.tokenSN?.toLowerCase() === 'virtual'
            ? 'VIRTUAL'
            : 'PHYSICAL',
        pinCode: null
      }));
  }

  invalidDate(notAfter: string, notBefore: string): boolean {
    const now = new Date().getTime();
    const from = new Date(notBefore).getTime();
    const to = new Date(notAfter).getTime();
    return now < from || now > to;
  }


  autoSign() {
    let sign = this.styxInfos()[0].thumbprint;
    this.signConfirmForm.patchValue({
      espKey: sign,
    })
    this.verifyEsp();
  }

  getChanges(event: { value: string }) {
    const data: any = this.styxInfos().find(res => res.thumbprint === event.value)
    const currentUrl = this.router?.url || '';
    const isAuthPage = currentUrl?.includes('/auth');

    if (data) {
      this.serialNumber.set(data.serialnumber)
      this.isVirtual.set(data.tokenSN)
    }

   if (data.tokenSN && isAuthPage) {
    //  this.analyticsService.logFirebaseCustomEvent('authorization_virtual_electronic_signature_button_click', {platform: "web"});
   } else  if (!data?.tokenSN && isAuthPage) {
    //  this.analyticsService.logFirebaseCustomEvent('authorization_physical_electronic_signature_button_click', {platform: "web"});
   }

  }

  selectTypeBack() {
    this.authService.userAnotherType(this.data?.action?.identityToken).pipe(takeUntil(this.unsub$)).subscribe(() => {
      this.router.navigate(['/auth'], { queryParams: { identityToken: this.data.action?.identityToken }})
    })
  }

  closeIcon() {

    if (this.data.action?.isAuth) {
      this.selectTypeBack()
    } else if (this.data.action?.type === 'physical_virtual_eds_and_qr') {
      this.router.navigate(['/settings/users'])
    } else if (this.data.action?.from === 'sign-history') {
      return this.dialogRef.close('update');
    } else if (this.data?.from === 'kartoteka') {
      return this.dialogRef.close('update');
    } else {
      this.router.navigate(['/auth'])
    }
    this.dialogRef.close('update');
  }


  toBase64(str: string) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  }

  confirm(data: any) {
// kkmas hash menga
    let hash: any = {
      action: this.data?.action?.action,
      isApplication: this.data.action?.isApplication || false,
      transactionSignActionDtos: this.data.action?.transactionSignActionDtos?.length ?
        this.data.action?.transactionSignActionDtos : [{
          id: this.data.action?.externalId,
          mode: this.data.action?.type
        }],
    };

    if (this.data.action?.isApplication) {
      hash = {
        action: this?.data?.action?.action,
        isApplication: true,
        applicationDetails: this.data.action?.applicationDetails?.length ?
          this.data.action?.applicationDetails :
          [{
            applicationId: this.data.action?.applicationId,
            id: this.data.action?.transactionId || null,
          }]
      }
    }

    const digest = this.toBase64(JSON.stringify(hash));
    if (this.data.action?.isAuth) {
      this.signAuth(data.sign)
    } else if (this?.data?.action?.actionType) {
      this.signUser(this?.data?.action?.actionType, data.sign);
    } else {
      this.sign(data.sign, digest);
      // !!  paymentSignAllAction jonataman data.sign  confirmMassivePayment
    }
  }

  confirmMassivePayment(data: any) {
    // kkmas hash
    this.signAllMassivePayments(data.sign);
  }

  signAllMassivePayments(data:{sign:string}) {
    this.espSignConfirmService.paymentSignAllAction(data.sign).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res) return;
          if (this.data.action.from === 'sign-payment') {
            this.dialog.open(SuccessModalComponent, {
              data: this.data.transaction,
              disableClose: true,
            })
          } else {
            const message = this.data.action.successMessage || 'Успешно!';
            this.toastrService.success(message);
          }
          this.dialogRef.close('update');
          this.utilsService.updateTransactions.next('update');
          this.cf.detectChanges();
        },
        error: (err: any) => {
          const message = err.message || err || 'Ошибка!';
          this.toastrService.error(message);
          this.utilsService.spinnerState$$.next(false);
          this.utilsService.updateTransactions.next('update');
          this.dialogRef.close();
          this.cf.detectChanges();
        }
      });
  }


  finalNavigate(identityToken: string) {
    if (this.activatedRoute.snapshot.queryParams['type'] === 'create') {
      this.router.navigate(['/auth/forget-password'], {queryParams: {identityToken: identityToken,mode:this.mode()}})
    } else {
      this.router.navigate(['/auth/sms-check'], {queryParams: {identityToken: identityToken, step: 'selectBusiness', mode:AUTH_SMS_STEP.PRE_BUSINESS_SELECTION}})
    }
    this.dialogRef.close();
  }

  signAuth(hash) {
    this.authService.loginConfirm({hash: hash, identity: this.data.action?.identityToken}).subscribe({
      next: res => {
        // this.analyticsService.logFirebaseCustomEvent('authorization_success', null);
         this.analyticsService.logFirebaseCustomEvent(
        'authorization_virtual_electronic_signature_result',
        { auth_flow_id: getAuthFlowId(), result: 'success' }
      );
      this.analyticsService.logFirebaseCustomEvent('authorization_success', null);

        localStorage.setItem('businessKeys', JSON.stringify(res.businessList));
        this.finalNavigate(res.identity)
      },
      error: (err: any) => {
        this.analyticsService.logFirebaseCustomEvent(
        'authorization_virtual_electronic_signature_result',
        { auth_flow_id: getAuthFlowId(), result: 'error',error_code:err.code,error_message:err.message }
      );
        const message = err.message || err || 'Ошибка!';
        this.toastrService.error(message);
        this.utilsService.spinnerState$$.next(false);
        this.utilsService.updateTransactions.next('update');
        this.dialogRef.close();
        this.cf.detectChanges();
      }
    });
  }

  signUser(name: string, sign: string) {
    if (name === 'Create') {
      // const tim = localStorage.getItem("digest")
      this.newSettingsService.createUserAccount({cms: sign})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.newSettingsService.triggerRefresh()
              this.openSuccessModal()
              this.newSettingsService.clearUserCreateDraft();
            } else {
              const mg = res.result?.message || '';
              this.toastrService.error(mg || "Произошла ошибка.");
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastrService.error(mg || "Произошла ошибка.");

          }
        });
    } else if (name === 'Delete') {
      this.newSettingsService.deleteUser({cms: sign})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.newSettingsService.triggerRefresh()
              this.openSuccessModal()
            } else {
              const mg = res.result?.message || '';
              this.toastrService.error(mg || "Произошла ошибка.");
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastrService.error(mg || "Произошла ошибка.");

          }
        });
    } else if (name === 'ChangeRole') {
      this.newSettingsService.changeUserRole({cms: sign})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.newSettingsService.triggerRefresh()
              this.openSuccessModal()
            } else {
              const mg = res.result?.message || '';
              this.toastrService.error(mg || "Произошла ошибка.");
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastrService.error(mg || "Произошла ошибка.");

          }
        });
    } else if (name === 'SignOrder') {
      this.newSettingsService.attachSignOrder({cms: sign})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.newSettingsService.triggerRefresh()
              this.openSuccessModal()
            } else {
              const mg = res.result?.message || '';
              this.toastrService.error(mg || "Произошла ошибка.");
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastrService.error(mg || "Произошла ошибка.");

          }
        });
    }
  }

  sign(sign: string, digest: any) {
    // !! todo api boshqa boladi holos mass payment digest kerakmas sign kerak holos.
    this.espSignConfirmService.paymentSignAction({
      sign,
      digest,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res) return;
          if (this.data.action.from === 'sign-payment') {
            this.dialog.open(SuccessModalComponent, {
              data: this.data.transaction,
              disableClose: true,
            })
          } else {
            const message = this.data.action.successMessage || 'Успешно!';
            this.toastrService.success(message);
          }
          this.dialogRef.close('update');
          this.utilsService.updateTransactions.next('update');
          this.cf.detectChanges();
        },
        error: (err: any) => {
          const message = err.message || err || 'Ошибка!';
          this.toastrService.error(message);
          this.utilsService.spinnerState$$.next(false);
          this.utilsService.updateTransactions.next('update');
          this.dialogRef.close();
          this.cf.detectChanges();
        }
      });
  }

  submit() {
    this.sendEvent()
    this.signConfirmForm.markAllAsTouched();
    if (this.signConfirmForm.invalid) return;
    this.verifyEsp();

  }
  sendEvent() {
    const currentUrl = this.router?.url || '';
    const isAuthPage = currentUrl?.includes('/auth');

    if (this.isVirtual() && isAuthPage) {
      // this.analyticsService.logFirebaseCustomEvent('authorization_virtual_electronic_signature_button_enter', {platform: "web"});
    } else  if (!this?.isVirtual() && isAuthPage) {
      // this.analyticsService.logFirebaseCustomEvent('authorization_physical_electronic_signature_button_enter', {platform: "web"});
    }
  }
  key(log: any) {
  }
  private handleVerifyEspGetSign(){
    if(this.data?.action?.isMassivePayment) {
      return this.data?.action?.massivePaymentData
    }
    return this.data?.action?.body
  }
  verifyEsp() {
    const {espKey} = this.signConfirmForm.value;
    const serial = this.serialNumber();
    if (this.remainingSeconds() > 0) {
      this.toastrService.warning('Подпись временно недоступна. Подождите окончания блокировки.');
      return;
    }
    if (this?.data?.action?.body) {
      // TODO massive yoki bu body. this.data?.action?.body ozgaradi holos.
      // DONE with handleVerifyEspGetSign()
      this.styxService.getSign(this.handleVerifyEspGetSign(), espKey, serial, this.isVirtual())
        .then((res2: any) => {

          // 1️⃣ Agar noto‘g‘ri kalit bo‘lsa (backend xatosi)
          if (res2.message === 'Неверный ключ' || res2.status === false) {
            this.toastrService.error('Неверный пароль. Попробуйте снова.');

            // this.analyticsService.logFirebaseCustomEvent('sign_error', {platform: "web", signature_type: this.isVirtual() ? "VIRTUAL" : "PHYSICAL"});

            this.espSignConfirmService.paymentCheckETSP({
              pinIncorrect: true,
              serialNumber: serial
            })!
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((res: any) => {
                if (!res.canSign) {
                  this.startCountdown(res.blockedTime);
                  const min = Math.ceil(res.blockedTime / 60);
                  this.toastrService.warning(`ЭЦП заблокирована на ${min} минут.`);
                }
              });

            return;
          }
          if (res2.status && res2.message) {
            this.utilsService.spinnerState$$.next(true);
              // !! todo confirmMass this.confirm({sign: res2.message});

            if(this?.data?.action?.isMassivePayment) {
              this.confirmMassivePayment({sign:res2.message})
            }else {
                this.confirm({sign: res2.message});
            }

          }
        })
        .catch(err => {
          console.error('verifyEsp error:', err);
          this.toastrService.error('Ошибка при подписании.');
        });
    } else {
      this.styxService.getSign({}, espKey, serial, this.isVirtual())
        .then((res2: any) => {

          // 1️⃣ Agar noto‘g‘ri kalit bo‘lsa (backend xatosi)
          if (res2.message === 'Неверный ключ' || res2.status === false) {
            this.toastrService.error('Неверный пароль. Попробуйте снова.');

            // this.analyticsService.logFirebaseCustomEvent('sign_error', {platform: "web", signature_type: this.isVirtual() ? "VIRTUAL" : "PHYSICAL"});

            this.espSignConfirmService.paymentCheckETSP({
              pinIncorrect: true,
              serialNumber: serial
            })
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((res: any) => {
                if (!res.canSign) {
                  this.startCountdown(res.blockedTime);
                  const min = Math.ceil(res.blockedTime / 60);
                  this.toastrService.warning(`ЭЦП заблокирована на ${min} минут.`);
                }
              });

            return;
          }
          if (res2.status && res2.message) {
            this.utilsService.spinnerState$$.next(true);
            this.confirm({sign: res2.message});
          }
        })
        .catch(err => {
          console.error('verifyEsp error:', err);
          this.toastrService.error('Ошибка при подписании.');
        });
    }

  }

  startCountdown(seconds: number) {
    this.remainingSeconds.set(seconds);
    clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      const current = this.remainingSeconds();
      if (current > 0) {
        this.remainingSeconds.set(current - 1);
      } else {
        clearInterval(this.countdownInterval);
        this.toastrService.success('ЭЦП снова доступна!');
        this.checkEtspCanSign();
      }
    }, 1000);
  }

  checkEtspCanAuth() {
    // this.analyticsService.logFirebaseCustomEvent('sign_error', {platform: "web", signature_type: this.isVirtual() ? "VIRTUAL" : "PHYSICAL"});
    this.espSignConfirmService.paymentCheckETSPAuth({
      pinIncorrect: false,
      serialNumber: this.serialNumber(),
      identity: this.data.action?.identityToken
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res) return;
        if (!res.canSign) {
          this.startCountdown(res.blockedTime);
          const minutes = Math.ceil(res.blockedTime / 60);
          this.toastrService.warning(`ЭЦП временно заблокирована. Осталось ${minutes} минут.`);
        } else {
          this.remainingSeconds.set(0);
          clearInterval(this.countdownInterval);
        }
      });
  }

  checkEtspCanSign() {
    const serial = this.serialNumber();

    // this.analyticsService.logFirebaseCustomEvent('sign_error', {platform: "web", signature_type: this.isVirtual() ? "VIRTUAL" : "PHYSICAL"});

    this.espSignConfirmService.paymentCheckETSP({
      pinIncorrect: false,
      serialNumber: serial
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (!res) return;
        if (!res.canSign) {
          this.startCountdown(res.blockedTime);
          const minutes = Math.ceil(res.blockedTime / 60);
          this.toastrService.warning(`ЭЦП временно заблокирована. Осталось ${minutes} минут.`);
        } else {
          this.remainingSeconds.set(0);
          clearInterval(this.countdownInterval);
        }
      });
  }

  directorSignConfirm() {
    this.confirm({sign: this.directorSign});
  }

  headOfFinanceSignConfirm() {
    this.confirm({sign: this.headOfFinanceSign});
  }

  openSuccessModal() {
    this.dialog.closeAll();
    this.dialog.open(SettingsSuccessModal, {
      data: {windowType: 'USER', type: 'user-process', actionType: this.data?.action?.actionType},
      disableClose: true,
    });
  }

  protected readonly Math = Math;
}
