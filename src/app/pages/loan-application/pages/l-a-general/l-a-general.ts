import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  ContactForm,
  ContactInfo,
  ExtraContacts,
  ExtraInfo,
  GeneralForm,
  GeneralInfo,
  RequiredButtons,
} from '@pages/loan-application/components';

@Component({
  selector: 'cf-l-a-general',
  imports: [ContactInfo, GeneralInfo, ExtraContacts, ExtraInfo, RequiredButtons, NzButtonComponent, RouterLink],
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

  openContactForm(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ContactForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
