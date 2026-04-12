import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputOtpComponent } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'cf-modal-otp',
  imports: [NzButtonComponent, NzIconDirective, TranslocoDirective, NzInputOtpComponent, NzTypographyComponent],
  templateUrl: './modal-otp.html',
  styleUrl: './modal-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOtp {
  nmRef = inject(NzModalRef);

  close(): void {
    this.nmRef.close(false);
  }

  submit(): void {
    this.nmRef.close(true);
  }
}
