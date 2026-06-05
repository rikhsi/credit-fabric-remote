import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, OnInit, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { FlowService } from '@pages/application/services';
import { AddressForm } from '@pages/application/components/address-form/address-form';
import { AddressInfo } from '@pages/application/components/address-info/address-info';
import { ContactInfo } from '@pages/application/components/contact-info/contact-info';
import { ExtraInfo } from '@pages/application/components/extra-info/extra-info';
import { ExtraForm } from '@pages/application/components/extra-form/extra-form';
import { GeneralInfo } from '@pages/application/components/general-info/general-info';
import { ApplicationFlowRoute } from '@app/constants/route-path';
import { isGeneralStepValid } from '@pages/application/utils/flow-step.validation';
import { AuthService } from '@core/services/auth.service';
import { OnlineApplication } from '@api/models/los/application';
import { OnlineStartProcessingExtraInformation, OnlineStartProcessingAddress } from '@api/models/los/start-processing';

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
  private authService = inject(AuthService);

  public readonly user = computed(() => this.authService.user());
  public readonly flowForm = linkedSignal(() => this.flowService.flowForm);

  get application(): OnlineApplication {
    return this.route.snapshot.data['application'];
  }

  get applicationId(): number {
    return this.route.snapshot.params['applicationId'];
  }

  ngOnInit(): void {
    this.flowService.initApplication(this.application, this.applicationId);
  }

  openExtraForm(): void {
    const modalRef = this.nzModalService.create<ExtraForm, OnlineStartProcessingExtraInformation, OnlineStartProcessingExtraInformation>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ExtraForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
      nzViewContainerRef: this.vcr,
      nzData: this.flowService.flowForm().value().extraInformation,
    });

    modalRef.afterClose.pipe(filter(Boolean), take(1)).subscribe((value) => {
      this.flowService.flowForm().value.update((cur) => {
        return {
          ...cur,
          extraInformation: value,
        };
      });
    });
  }

  openAddressForm(editIndex: number): void {
    const items = this.flowService.flowForm().value().addresses;
    const nzData = items[editIndex];

    const modalRef = this.nzModalService.create<AddressForm, OnlineStartProcessingAddress, OnlineStartProcessingAddress>({
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
        const addresses = cur.addresses.map((item, index) =>
          index === editIndex ? { ...value, sysAddressTypeId: item.sysAddressTypeId } : item,
        );

        return {
          ...cur,
          addresses,
        };
      });
    });
  }

  continue(): void {
    if (isGeneralStepValid(this.flowService.flowForm)) {
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
    this.flowForm().name().markAsDirty();
    this.flowForm().addresses().markAsDirty();
    this.flowForm().extraInformation().markAsDirty();

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
