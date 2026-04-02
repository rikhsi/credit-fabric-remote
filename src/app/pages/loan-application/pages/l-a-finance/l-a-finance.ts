import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FinanceForm, FinanceInfo } from '@pages/loan-application/components';

@Component({
  selector: 'cf-l-a-finance',
  imports: [NzButtonComponent, NzIconDirective, RouterLink, FinanceInfo],
  templateUrl: './l-a-finance.html',
  styleUrl: './l-a-finance.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LAFinance {
  private nzModalService = inject(NzModalService);

  isEmpty = signal<boolean>(true);

  openFinanceForm(): void {
    this.nzModalService.create({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: FinanceForm,
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
