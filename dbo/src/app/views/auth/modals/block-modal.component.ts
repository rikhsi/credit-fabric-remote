import { ChangeDetectionStrategy, Component, inject, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import {animate, group, query, style, transition, trigger} from "@angular/animations";
import {IdleTimerCircleComponent} from "../../../core/components/idle-timer-circle/idle-timer-circle.component";
import {TranslateModule} from "@ngx-translate/core";
import {NgIf} from "@angular/common";
import { FirebaseAnalyticsService } from 'firebase-analytics.service';
import { getAuthFlowId } from 'src/app/core/utils';

export type BlockReason = 
  | 'phone_check_attempt_limit'
  | 'password_attempt_limit' 
  | 'otp_attempt_limit'
  | 'ecp_attempt_limit'
  | 'myid_attempt_limit';

  export interface BlockModalData {
  forever?: boolean;
  blockedTime: number;
  remainingTime: number;
  reason?: BlockReason;
}


@Component({
  selector: 'app-agree-modal',
  imports: [
    MatDialogClose,
    MatIcon,
    MatRipple,
    IdleTimerCircleComponent,
    TranslateModule,
    NgIf
  ],
  templateUrl: './block-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.1)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.1)' }))
      ])
    ])
  ],
})
export class BlockModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BlockModalData,
        private analyticsService: FirebaseAnalyticsService,
    private matDialogRef: MatDialogRef<BlockModalComponent>
  ) {
  }

  close() {
    this.matDialogRef.close("close");
  }
  
  callBank() {
    this.analyticsService.logFirebaseCustomEvent(
      'authentication_user_blocked_call_bank',
      {
        reason: this.data.reason ?? 'phone_check_attempt_limit',
        auth_flow_id:getAuthFlowId()
      },
      'auth'
    );
 
  }

}
