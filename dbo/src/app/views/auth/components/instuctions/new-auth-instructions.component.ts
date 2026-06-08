import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef, inject,
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
import {NgxMaskDirective, provideNgxMask, NgxMaskPipe} from "ngx-mask";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SettingsService} from "../../../main/features/settings/services/settings.service";
import {NgForOf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FirebaseAnalyticsService} from "../../../../../../firebase-analytics.service";

@Component({
  selector: 'app-instructions',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    TranslateModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './new-auth-instructions.component.html',
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


export class NewAuthInstructionsComponent {
  public router = inject(Router)
  constructor(
    private analyticsService: FirebaseAnalyticsService
  ) {
  }
  sendPhoneEvent(){
    this.analyticsService?.logFirebaseCustomEvent('call_bank_button_click', null)
  }
}
