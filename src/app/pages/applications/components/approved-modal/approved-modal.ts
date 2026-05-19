import { ChangeDetectionStrategy, Component, Inject, model, OnInit } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalRef, NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ConfirmModal } from '@typings';

@Component({
  selector: 'cf-approved-modal',
  imports: [NzButtonComponent, TranslocoDirective, NzIconDirective],
  templateUrl: './approved-modal.html',
  styleUrl: './approved-modal.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApprovedModal implements OnInit {
  config = model<ConfirmModal>();

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) private modalData: ConfirmModal,
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
