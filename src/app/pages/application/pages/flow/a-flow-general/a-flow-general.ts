import { ChangeDetectionStrategy, Component, inject, linkedSignal, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { filter, take } from 'rxjs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { AddressForm, AddressInfo, BillInfo, ContactInfo, ExtraInfo, GeneralForm, GeneralInfo } from '@pages/application/components';
import { FlowService } from '@pages/application/services';
import { FlowAddressForm, FlowExtraInformationForm } from '@pages/application/models';

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
  private vcr = inject(ViewContainerRef);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  openGeneralForm(): void {
    const modalRef = this.nzModalService.create<GeneralForm, FlowExtraInformationForm, FlowExtraInformationForm>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: GeneralForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowForm()().value.update((cur) => {
        return {
          ...cur,
          extraInformations: [...cur.extraInformations, value],
        };
      });
    });
  }

  openAddressForm(): void {
    const modalRef = this.nzModalService.create<AddressForm, FlowAddressForm, FlowAddressForm>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: AddressForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowForm()().value.update((cur) => {
        const addresses = cur.addresses.filter((item) => item.addressType !== value.addressType);

        return {
          ...cur,
          addresses: [...addresses, value],
        };
      });
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
