import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import {AuthService} from '../../services/auth.service';
import {NotificationService} from "../../../../core/services/notification.service";
import {AgreeDialogComponent} from "../../../../core/components/agree-dialog/agree-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import {StyxService} from "../../../../core/services/styx.service";
import { UpdateStyxComponent } from '../../../../shared/components/update-styx/update-styx.component';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask} from "ngx-mask";
import {UiOtpInputComponent} from "../../../../core/components/ui-otp-input/ui-otp-input.component";
import {ModalComponent} from "../esp/modals/modal.component";
import {EspSignConfirmComponent} from "../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {TranslateModule} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    ModalComponent,
    TranslateModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-phys-esp.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ]
})
export class NewAuthPhysEspComponent implements OnInit {
  serialNumber = signal('')
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])
  virtualKeys = signal(0)
  physicalKeys = signal(0)
  unsub$ = new Subject<void>();
  loginStep: 'login' | 'esp' | 'selectBusiness' | 'code' | 'password' | string = 'login';
  isOpen = false;
  phone = '';
  chooseType: boolean = true;
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
    private utilsService: UtilsService,
    private authService: AuthService,
    private _dialog: MatDialog,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    private styxService: StyxService,
    private cd: ChangeDetectorRef,
    private analyticsService: FirebaseAnalyticsService,
  ) {
  }

  ngOnInit() {
    this.getEspKeys();
    this.utilsService.spinnerState$$.next(false);
  }

  getEspKeys() {
    this.styxService.getInfo().then((res: any) => {
      this.virtualKeys.set(res.infos.filter(item => item.tokenSN === 'Virtual')?.length)
      this.physicalKeys.set(res.infos.filter(item => item.tokenSN !== 'Virtual')?.length)
    })
    this.cd.detectChanges();
  }

  selectTypeBack() {
    this.authService.userAnotherType(this.activatedRoute.snapshot.queryParams['identityToken']).pipe(takeUntil(this.unsub$)).subscribe(() => {
      this.router.navigate(['/auth'], { queryParams: { identityToken: this.activatedRoute.snapshot.queryParams['identityToken'] } })
    })
  }

  onSubAction(isVirtual: boolean) {
    this.chooseType = false;
    this._dialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: {
        action: {
          isAuth: true,
          isVirtual: isVirtual,
          identityToken: this.activatedRoute.snapshot.queryParams['identityToken'],
        },
        transaction: {}
      },
    }).afterClosed().subscribe(() => {
      this.selectTypeBack()
    })
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
}
