import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AccountsDto } from '../../../views/main/features/accounts-payments/models/accounts-payments.model';
import { NgxMaskPipe } from 'ngx-mask';
import { MatTooltip } from '@angular/material/tooltip';
import { NgOptimizedImage } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-account',
    imports: [
        NgxMaskPipe,
        MatTooltip,
        NgOptimizedImage
    ],
    templateUrl: './account.component.html',
    styles: ``,
    styleUrls: ['./account.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountComponent {
  @Input() account!: AccountsDto;
  protected readonly Number = Number;

  constructor(
    private clipboard: Clipboard,
    private toastrService: ToastrService
  ) {
  }

  copyAcc() {
    const res = this.clipboard.copy(this.account.altAcctId);

    if(res) {
      this.toastrService.success('Скопировано!');
    }
  }
}
