import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import {Subject, take, takeUntil} from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

// import {AuthService} from '../../services/auth.service';
// import {NotificationService} from "../../../../core/services/notification.service";
// import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {ActivatedRoute, Router} from '@angular/router';
// import {StyxService} from "../../../../core/services/styx.service";
// import {UpdateStyxComponent} from '../../../../shared/components/update-styx/update-styx.component';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
// import {UiOtpInputComponent} from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgIf} from "@angular/common";
import {UiOtpInputComponent} from "../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {AuthService} from "../../../../../auth/services/auth.service";
import {NotificationService} from "../../../../../../core/services/notification.service";
import {StyxService} from "../../../../../../core/services/styx.service";
import {AgreeDialogComponent} from "../../../../../../core/components/agree-dialog/agree-dialog.component";
import {UpdateStyxComponent} from "../../../../../../shared/components/update-styx/update-styx.component";
import {MatIcon} from "@angular/material/icon";
import {NewSettingsService} from "../../services/new-settings.service";
import {EmailCodeDialogComponent} from "../settings-dialogs/email-code-dialog/email-code-dialog.component";
import {SmsCodeDialogComponent} from "../settings-dialogs/sms-code-dialog/sms-code-dialog.component";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgxMaskDirective,
    NgxMaskPipe,
    UiOtpInputComponent,
    NgIf,
    MatDialogClose,
    MatIcon,
  ],
  providers: [provideNgxMask()],
  templateUrl: './settings-auth-myId.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({opacity: 0, transform: 'scaleY(0)'}),
        animate('200ms ease-out', style({opacity: 1, transform: 'scaleY(1)'})),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({opacity: 0, transform: 'scaleY(0)'})),
      ]),
    ]),
  ]
})
export class SettingsAuthMyIdComponent implements OnInit, OnDestroy {
  safeUrl: SafeResourceUrl | null = null;
  serialNumber = signal('')
  styxInfos = signal<Array<{ company: string, fio: string, serialnumber: string, thumbprint: string }>>([])

  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  focusLogin = false;
  identityToken = '';
  isOpen = false;
  visible = signal(false)
  phone = '';
  myIdUrl = '';
  typeSituation = '';
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    login: [''],
    code: ['', Validators.minLength(6)],
    espKey: '',
    businessId: null as unknown as number,
    businessName: '',
    identityToken: '',
  });
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private utilsService: UtilsService,
    private toastService: ToastrService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    protected router: Router,
    private styxService: StyxService,
    private sanitizer: DomSanitizer,
    private newSettingsService: NewSettingsService,
    @Inject(MAT_DIALOG_DATA) public data: {
      newPhoneNumber: string,
      requestId?: string,
    },
    private matDialog: MatDialog,
    public matMyIdDialogRef: MatDialogRef<SettingsAuthMyIdComponent>,

  ) {
  }

  ngOnInit() {
    this.checkFromRegistration();
    window.addEventListener('message', this.myIdCheck)
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.MyId_BASE}/?iframe=true&session_id=${this.activatedRoute.snapshot.queryParams['sessionId']}&theme=light&lang=ru`);
  }

  checkFromRegistration() {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (val) => {
          console.log('checkFromRegistration', val, 11, val['type'])
          this.typeSituation = val['type'] || '';
        }
      });
  }
clearEventListener(): void {
    try {
      window.removeEventListener('message', this.myIdCheck);
    } catch (e) {}
  }
  ngOnDestroy(): void {
    this.unsub$?.next();
    this.unsub$?.complete();
    this.socket$?.complete();
    this.clearEventListener()
  }

  MyIDStatus = {
    EXCEPTION: -1,
    IN_PROGRESS: 0,
    LIVENESS_PASSED: 1,
    LIVENESS_FAILED: 2,
    RETRY: 3,
    EXITED: 4,

    LOADING: 100,
    LOADED: 101,
  };

  // this.newSettingsService.changeUserEmail({newEmail: this.data.email}).pipe(take(1))
  //   .subscribe({
  //     next: (res: any) => {
  //       console.log(4444550, res)
  //       this.loadingConfirm = false;
  //       this.openEmailDialog(res.requestId)
  //     },
  //     error: (err) => {
  //       this.loadingConfirm = false;
  //      console.error(err);
  //     }
  //   });
  changePhone(authCode: string) {
    this.clearEventListener()
    console.log('changePhone000', authCode, this.data);
    if (!this.data?.newPhoneNumber) {
      this.matDialog.closeAll();
      this.toastService.error("Номер телефона не найден.");
      return
    }

    this.newSettingsService.changeUserPhone({
      hash: authCode,
      newPhoneNumber: `998${this.data?.newPhoneNumber}`
    }).pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log("changePhone11", res)
          if (res){
            this.openSmsDialog(res.requestId)
          } else {
            this.matDialog.closeAll();
            this.toastService.error("Произошла ошибка.");
          }
        },
        error: (error) => {
          console.log("errorerror",error,  error.message);
          this.matDialog.closeAll();
          this.toastService.error("Произошла ошибка.");
        }
      })
  }
  passwordChange(authCode: string) {
    this.clearEventListener()
    console.log('changePhone00055', authCode, this.data);
    if (!(this.data?.requestId && authCode)) {
      this.matDialog.closeAll();
      this.toastService.error("Номер телефона не найден.");
      return
    }
    this.newSettingsService.confirmUserPasswordMyId({
      hash: authCode,
      requestId: this.data?.requestId
    }).pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log("changePhone11", res)
          if (res.success) {
            // this.openSmsDialog(res.requestId)
            this.toastService.success("Успешно");
            this.matDialog.closeAll();
            // this.router.navigate(['/settings/security']);
            this.userService.logout();

          } else {
            this.matDialog.closeAll();
            this.toastService.error("Произошла ошибка.");
          }
        },
        error: (error) => {
          console.log("errorerror",error,  error.message);
          this.matDialog.closeAll();
          this.toastService.error("Произошла ошибка.");
        }
      })
  }

  myIdCheck = (e: MessageEvent<any>) => {
    console.log("myIdCheck", e.data)
    if (e.data.source != "MyIDWebSDK") return;
    switch (e.data.status) {
      case this.MyIDStatus.EXCEPTION:
        console.log(
          "MyID Iframe failed to load properly or a runtime error occurred.",
          e.data.error
        );
        break;
      case this.MyIDStatus.IN_PROGRESS:
        break;
      case this.MyIDStatus.LIVENESS_PASSED:
        console.log(110001, e.data?.data?.auth_code)
        if (this.typeSituation === 'passwordChange') {
          this.passwordChange(e.data?.data?.auth_code);
        } else {
          this.changePhone(e.data?.data?.auth_code);
        }

        break;
      case this.MyIDStatus.LIVENESS_FAILED:
        this.incorrectInformation(e.data)
        break;
      case this.MyIDStatus.RETRY:
        break;
      case this.MyIDStatus.EXITED:
        break;
      default:
        console.log("Unknown status:", e.data);
    }
  }

  incorrectInformation(item: any){
    this.toastService.error(item.data?.data?.result_note || 'Что то пошло не так...');
    this.clearEventListener()
    this.matDialog.closeAll();
  }

  verifyCode() {
    let {code, identityToken} = this.loginForm.getRawValue();
    this.utilsService.spinnerState$$.next(true);
    this.authService.verifySmsCode(code as any, identityToken)
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          // if(userData) {
          //   this._notificationService.requestPermission();
          //   this.userService.setUserData(userData);
          // }
          const {businessList, identityToken} = res;
          this.businessKeys = businessList;
          this.loginForm.controls.identityToken.patchValue(identityToken);
          this.loginStep = 'selectBusiness';
          this.cf.detectChanges();
        },
        error: (err) => {
          this.toastService.error(err);
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      })
  }


  loadEspKeys() {
    this.styxService.getInfo()
      .then((res1: any) => {
        if (res1.status) {
          this.styxInfos.set(res1.infos)
          if (res1.infos.length > 0) {
            // this.formModel.patchValue({
            //   clientThumb: res1.infos[0].thumbprint
            // })
          }
          if (window.navigator.platform === 'MacIntel') {
            this.serialNumber.set(res1.infos[0].serialnumber)
            localStorage.setItem('serial_number', this.serialNumber())
          }
        } else {
          this.styxInfos.set([]);
          this.toastService.error(res1.message);
        }
      })
      .catch((error) => {
        this.toastService.error(error);
      });
  }

  setValuesToForm(name: string, event: any, type: 'input' | 'text') {
    const value = type === 'input' ? event.target.value : event;
    this.loginForm.patchValue({[name]: value})
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }


  submit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.verifyCode();
  }

  openSmsDialog(requestId:string): void {
    if (!requestId) {
      this.matDialog.closeAll();
      return
    }
    this.matDialog.closeAll();
    this.matDialog.open(SmsCodeDialogComponent, {
      data: {requestId, newPhoneNumber: this.data.newPhoneNumber},
      width: '540px',
    })
  }
  continueProcess(){
    // this.router.navigate(['/auth/sms-check'], { queryParams: { identityToken: identityToken, step: 'selectBusiness' } });
    this.visible.set(false)
    this.matDialog.closeAll();
  }
}
