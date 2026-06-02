import { ChangeDetectionStrategy, Component, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { FlowService } from '@pages/application/services';
import { OnlineApplication } from '@api/models/los/online';
import { AddressForm } from '@pages/application/components/address-form/address-form';
import { AddressInfo } from '@pages/application/components/address-info/address-info';
import { ContactInfo } from '@pages/application/components/contact-info/contact-info';
import { ExtraInfo } from '@pages/application/components/extra-info/extra-info';
import { GeneralForm } from '@pages/application/components/general-form/general-form';
import { GeneralInfo } from '@pages/application/components/general-info/general-info';
import { flowExtraInformationFormModel } from '@pages/application/data/form';
import { ApplicationFlowRoute } from '@app/constants/route-path';
import { FlowAddressForm, FlowExtraInformationForm } from '@pages/application/models/form';
import { isGeneralStepValid } from '@pages/application/utils/flow-step.validation';

@Component({
  selector: 'cf-a-flow-general',
  imports: [ContactInfo, GeneralInfo, ExtraInfo, NzButtonComponent, AddressInfo, TranslocoDirective],
  templateUrl: './a-flow-general.html',
  styleUrl: './a-flow-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AFlowGeneral implements OnInit {
  private nzModalService = inject(NzModalService);
  private flowService = inject(FlowService);
  private vcr = inject(ViewContainerRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  get application(): OnlineApplication {
    return this.route.snapshot.data['application'];
  }

  ngOnInit(): void {
    this.flowService.initApplication(this.application);
  }

  openGeneralForm(editIndex?: number): void {
    const items = this.flowService.flowForm().value().extraInformations;
    const nzData = editIndex !== undefined ? items[editIndex] : flowExtraInformationFormModel;

    const modalRef = this.nzModalService.create<GeneralForm, FlowExtraInformationForm, FlowExtraInformationForm>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: GeneralForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowService.flowForm().value.update((cur) => {
        const extraInformations =
          editIndex !== undefined
            ? cur.extraInformations.map((item, index) => (index === editIndex ? value : item))
            : [...cur.extraInformations, value];

        return {
          ...cur,
          extraInformations,
        };
      });
    });
  }

  openAddressForm(editIndex: number): void {
    const items = this.flowService.flowForm().value().addresses;
    const nzData = items[editIndex];

    const modalRef = this.nzModalService.create<AddressForm, FlowAddressForm, FlowAddressForm>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: AddressForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
      nzData,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowService.flowForm().value.update((cur) => {
        const addresses = cur.addresses.map((item, index) => (index === editIndex ? value : item));

        return {
          ...cur,
          addresses,
        };
      });
    });
  }

  continue(): void {
    if (isGeneralStepValid(this.flowService.flowForm().value())) {
      void this.router.navigate([ApplicationFlowRoute.Finance], { relativeTo: this.route.parent });
      return;
    }

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
