import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter, Input,
  OnDestroy,
  OnInit, Output,
  signal
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {ToastrService} from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import {WebSocketSubject} from 'rxjs/webSocket';
import {UserService} from 'src/app/core/services/user.service';
import {UtilsService} from 'src/app/core/services/utils.service';

import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
import {filter} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NgClass, NgForOf} from "@angular/common";
import {UiOtpInputComponent} from "../../../../../../core/utils/ui-otp-input.component";
import {AuthService} from "../../../../../auth/services/auth.service";
import { NotificationService } from 'src/app/core/services/notification.service';
import {NewAuthBusinessComponent} from "../../../../../auth/components/businessList/new-auth-business.component";

@Component({
  selector: 'app-business-change',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    NgxMaskDirective,
    NgxMaskPipe,
    UiOtpInputComponent,
    NgClass,
    NgForOf,
    NewAuthBusinessComponent,
  ],
  providers: [provideNgxMask()],
  templateUrl: './business-change.component.html',
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
export class NewBusinessChangeComponent implements OnInit, OnDestroy {
  serialNumber = signal('')
  styxInfos = signal<Array<{company: string ,fio: string ,serialnumber: string ,thumbprint: string}>>([])

  unsub$ = new Subject<void>();
  timer = 59;
  intervalId!: NodeJS.Timer;
  isOpen = false;
  phone = '';
  @Output() public submitSelection = new EventEmitter<number>();
  @Input() public data: any = [];
  businessKeys: { businessId: number, businessName: string }[] = [];
  private socket$!: WebSocketSubject<any>;
  loginForm = this.fb.nonNullable.group({
    code: ['', Validators.minLength(6)],
  });



  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private userService: UserService,
    private _notificationService: NotificationService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
  ) {
  }

  ngOnInit() {
    this.getBusinessAll()
  }


  getBusinessAll() {
    this.authService.getAllBusiness().pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res) => {
          this.businessKeys = res.content
          this.cf.detectChanges();
        }
      })
  }

  verify(businessId: number) {
    this.utilsService.spinnerState$$.next(true);
    this.authService.businessInit(businessId)
      .pipe(takeUntil(this.unsub$))
      .subscribe({
        next: (res: any) => {
          if(res) {
            this._notificationService.requestPermission();
            this.userService.setUserData(res, true);
            this.router.navigate(['/main']).then(() => {
              window.location.reload();
            });
            this.cf.detectChanges();
            // }
          }
        },
        error: (err) => {
          this.toastrService.error(err);
          this.utilsService.spinnerState$$.next(false);
          this.cf.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsub$?.next();
    this.unsub$?.complete();
    this.socket$?.complete();
  }
}
