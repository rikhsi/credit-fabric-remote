import { ChangeDetectionStrategy, Component, Inject, model } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { DecimalPipe } from '@angular/common';
import { SuccessModalData } from '@pages/loan-application/models';

@Component({
  selector: 'cf-success-modal',
  imports: [NzButtonComponent, TranslocoDirective, NzIconDirective, DecimalPipe],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessModal implements OnInit {
  config = model<SuccessModalData>();

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) private modalData: SuccessModalData,
  ) {}

  ngOnInit(): void {
    this.config.update(() => this.modalData);
  }

  cancel(): void {
    this.modalRef.close(false);
  }

  submit(): void {
    this.modalRef.close(true);
  }
}
