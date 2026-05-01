import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { AddressForm, AddressInfo, BillInfo, ContactInfo, ExtraInfo, GeneralForm, GeneralInfo } from '@pages/application/components';
import { FlowService } from '@pages/application/services';

@Component({
  selector: 'cf-a-flow-general',
  imports: [ContactInfo, GeneralInfo, ExtraInfo, NzButtonComponent, AddressInfo, BillInfo, TranslocoDirective],
  templateUrl: './a-flow-general.html',
  styleUrl: './a-flow-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowGeneral {
  private nzModalService = inject(NzModalService);
  private flowService = inject(FlowService);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  openGeneralForm(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: GeneralForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  openAddressForm(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: AddressForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  continue(): void {
    if (this.flowForm()().valid()) {
    } else {
      this.flowForm().oked().markAsDirty();
      this.flowForm().workerNewAmount().markAsDirty();
      this.flowForm().workerAmount().markAsDirty();

      this.scrollToInvalidElement();
    }
  }

  private scrollToInvalidElement(): void {
    setTimeout(() => {
      const el = document.querySelector('.ant-form-item-explain-error');

      if (el) {
        (el as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 50);
  }
}
