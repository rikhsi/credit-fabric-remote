import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { AddressInfo, ContactInfo, ExtraInfo, GeneralForm, GeneralInfo } from '@pages/loan-application/components';

@Component({
  selector: 'cf-l-a-general',
  imports: [ContactInfo, GeneralInfo, ExtraInfo, NzButtonComponent, RouterLink, AddressInfo],
  templateUrl: './l-a-general.html',
  styleUrl: './l-a-general.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LAGeneral {
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
}
