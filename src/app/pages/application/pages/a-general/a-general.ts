import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { AddressForm, AddressInfo, BillInfo, ContactInfo, ExtraInfo, GeneralForm, GeneralInfo } from '@pages/application/components';

@Component({
  selector: 'cf-a-general',
  imports: [ContactInfo, GeneralInfo, ExtraInfo, NzButtonComponent, RouterLink, AddressInfo, BillInfo, TranslocoDirective],
  templateUrl: './a-general.html',
  styleUrl: './a-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AGeneral {
  private nzModalService = inject(NzModalService);

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
}
