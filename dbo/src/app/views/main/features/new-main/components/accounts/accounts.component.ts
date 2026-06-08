import {
  ChangeDetectionStrategy,
  Component,
  Input,
  input,
  output,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {NgxMaskPipe} from "ngx-mask";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {maskNumberMiddle} from "../../../../../../core/utils/mixin.utils";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {TranslateModule} from "@ngx-translate/core";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";
import {ThemeService} from "../../../../../../shared/services/theme.service";
import { MatTooltip } from '@angular/material/tooltip';
import {  TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-accounts',
  imports: [
    NgxMaskPipe,
    NgIf,
    UiSvgIconComponent,
    TranslateModule,
    MatMenu,
    MatMenuTrigger,
    NgOptimizedImage,
    MatTooltip
  ],
  templateUrl: './accounts.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountsComponent {
  @Input() refreshTrigger: number = 0;
  accounts = input<AccountsDto[]>([]);
  globalHideBalance = input<boolean>(false);
  hiddenAccountIds = input<string[]>([]);
  showAccountIds = input<string[]>([]);
  theme = inject(ThemeService)

  toggleAccount = output<string>();
  refreshAccount = output<void>();


  translateService = inject(TranslateService)

  protected readonly maskNumberMiddle = maskNumberMiddle;
  constructor(private cdr: ChangeDetectorRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.refreshAccount.emit();
    }
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  onToggleAccount(id: string) {
    this.toggleAccount.emit(id);
  }
  isHidden(acctId ='') {
    if (this.globalHideBalance()) {
      if (this.globalHideBalance() && this.showAccountIds()?.length) {
        return acctId && this.showAccountIds()?.length ? !this.showAccountIds().includes(acctId) : false;
      }
      return true;
    } else {
      return acctId && this.hiddenAccountIds()?.length ? this.hiddenAccountIds().includes(acctId) : false;
    }

  };



  blockedTooltip(accounts: AccountsDto): string {
    const reason =  this.getBlockedReason({accBlockReason:accounts.accBlockReason, accBlockDetails:accounts.accBlockDetails})
    const dateLabel = this.translateService.instant('myAccounts.block_date', { date: accounts.accBlockDate });
    return reason ? `${reason}\n${dateLabel}` : dateLabel;
  }


  private getBlockedReason(info: {
    accBlockReason?: string | null;
    accBlockDetails?: string | null;
  }): string {

    if (info.accBlockReason?.trim()) {
      return info.accBlockReason;
    }

    if (info.accBlockDetails?.trim()) {
      return info.accBlockDetails;
    }
    return '';
  }


}
