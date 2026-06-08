import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DepositeTableItemComponent } from "./deposite-table-item/deposite-table-item.component";
import { TranslateModule } from '@ngx-translate/core';
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-deposit-table',
  imports: [DepositeTableItemComponent, MatIconModule, TranslateModule],
  template: `
    <div class="rounded-xl overflow-hidden">
      <!-- Header row -->
      <div
        class="grid gap-x-4 px-0 py-3 border-b border-custom-soft-200"
        style="grid-template-columns: 320px 240px minmax(240px, 1.5fr) 40px 40px 40px">
        <span class="text-sm text-custom-secondary tracking-wide">{{ 'createPayment.name' | translate }}</span>
        <span class="text-sm text-custom-secondary tracking-wide">{{ 'deposits.account_number' | translate }}</span>
        <span class="flex items-center gap-1 text-sm text-custom-secondary tracking-wide">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.00011 13.3333V4.27604L2.47147 5.80469C2.21112 6.06504 1.78911 6.06504 1.52876 5.80469C1.26841 5.54434 1.26841 5.12233 1.52876 4.86198L4.19543 2.19531L4.24621 2.14974C4.50806 1.93617 4.89406 1.95124 5.13813 2.19531L7.8048 4.86198C8.06515 5.12233 8.06515 5.54434 7.8048 5.80469C7.54445 6.06504 7.12244 6.06504 6.86209 5.80469L5.33345 4.27604V13.3333C5.33345 13.7015 5.03497 14 4.66678 14C4.29859 14 4.00011 13.7015 4.00011 13.3333ZM10.6668 2.66667C10.6668 2.29848 10.9653 2 11.3334 2C11.7016 2 12.0001 2.29848 12.0001 2.66667V11.724L13.5288 10.1953C13.7891 9.93496 14.2111 9.93496 14.4715 10.1953C14.7318 10.4557 14.7318 10.8777 14.4715 11.138L11.8048 13.8047C11.5445 14.065 11.1224 14.065 10.8621 13.8047L8.19543 11.138C7.93508 10.8777 7.93508 10.4557 8.19543 10.1953C8.45577 9.93496 8.87778 9.93496 9.13813 10.1953L10.6668 11.724V2.66667Z" fill="#A4A4A4"/>
          </svg>
          {{ 'deposits.amount' | translate }}
        </span>
        <span></span>
        <span></span>
        <span>
        </span>
      </div>
      <!-- Data rows -->
      @for (account of dataList(); track account.id) {
        <app-deposite-table-item
          [activeTab]="activeTab()"
          [dataItem]="account"
          [hiddenAccounts]="hiddenSet()"
          (pinClick)="onPin($event)"
          (visibilityToggle)="onToggleVisibility($event)"
          (requisite)="requisite.emit($event)"
          (statementNavigate)="statementNavigate.emit($event)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTableComponent {
  dataList = input.required<any[]>();
  activeTab  = input.required<'active' | 'closed'>();

  pinClick = output<{ id: string; altAcctId: string }>();
  requisite = output<{ altAcctId: string; id: string }>();
  statementNavigate = output<string>();

  hiddenSet = signal<Set<string>>(new Set());

  onPin(event: { id: string; altAcctId: string }): void {
    this.pinClick.emit(event);
  }

  onToggleVisibility(altAcctId: string): void {
    const current = new Set(this.hiddenSet());
    if (current.has(altAcctId)) {
      current.delete(altAcctId);
    } else {
      current.add(altAcctId);
    }
    this.hiddenSet.set(current);
  }
}
