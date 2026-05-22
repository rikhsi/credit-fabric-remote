import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { FlowService } from '@pages/application/services';
import { OnlineApplication } from '@api/models/los/online';
import { AddressForm } from '@pages/application/components/address-form/address-form';
import { AddressInfo } from '@pages/application/components/address-info/address-info';
import { BillInfo } from '@pages/application/components/bill-info/bill-info';
import { ContactInfo } from '@pages/application/components/contact-info/contact-info';
import { ExtraInfo } from '@pages/application/components/extra-info/extra-info';
import { GeneralForm } from '@pages/application/components/general-form/general-form';
import { GeneralInfo } from '@pages/application/components/general-info/general-info';
import { FlowAddressForm, FlowExtraInformationForm } from '@pages/application/models/form';

@Component({
  selector: 'cf-a-flow-general',
  imports: [ContactInfo, GeneralInfo, ExtraInfo, NzButtonComponent, AddressInfo, BillInfo, TranslocoDirective],
  templateUrl: './a-flow-general.html',
  styleUrl: './a-flow-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowGeneral implements OnInit {
  private nzModalService = inject(NzModalService);
  private flowService = inject(FlowService);
  private vcr = inject(ViewContainerRef);
  private route = inject(ActivatedRoute);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  get application(): OnlineApplication {
    return this.route.snapshot.data['application'];
  }

  ngOnInit(): void {
    this.flowService.initApplication(this.application);
  }

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
      this.flowForm().newEmployees().markAsDirty();
      this.flowForm().employees().markAsDirty();
      this.flowForm().legalForm().markAsDirty();
      this.flowForm().ownershipCode().markAsDirty();
      this.flowForm().registrationDate().markAsDirty();
      this.flowForm().registrationNumber().markAsDirty();
      this.flowForm().registrationPlaceCode().markAsDirty();
      this.flowForm().workPhone().markAsDirty();
      this.flowForm().docPersonalLegalNo().markAsDirty();
      this.flowForm().email().markAsDirty();
      this.flowForm().id().markAsDirty();
      this.flowForm().name().markAsDirty();
      this.flowForm().addresses().markAsDirty();
      this.flowForm().extraInformations().markAsDirty();

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
