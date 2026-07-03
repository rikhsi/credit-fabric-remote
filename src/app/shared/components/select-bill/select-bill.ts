import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { OnlineAccount } from '@api/models/los/account';
import { ControlBaseDirective } from '@shared/directives';
import { maskAccountNumber } from '@shared/utils/account';

@Component({
  selector: 'cf-select-bill',
  imports: [NzDropdownModule, NgTemplateOutlet, NzIconDirective, NzTypographyComponent, DecimalPipe],
  templateUrl: './select-bill.html',
  styleUrl: './select-bill.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBill extends ControlBaseDirective<string | null> {
  readonly accounts = input<OnlineAccount[]>([]);
  value = model<string | null>(null);

  protected readonly dropdownVisible = signal(false);

  protected readonly selectedAccount = computed(() => {
    const accounts = this.accounts();
    const selectedAccountNo = this.value();

    if (selectedAccountNo) {
      return accounts.find((item) => item.account === selectedAccountNo) ?? null;
    }

    return accounts[0] ?? null;
  });

  protected readonly maskAccountNumber = maskAccountNumber;

  protected selectAccount(account: OnlineAccount): void {
    this.value.set(account.account);
    this.dropdownVisible.set(false);
  }
}
