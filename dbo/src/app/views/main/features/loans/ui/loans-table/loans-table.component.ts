import { ChangeDetectionStrategy, Component, inject, Input, input } from '@angular/core';
import { NgIf, NgOptimizedImage } from "@angular/common";
import { NgxMaskPipe } from "ngx-mask";
import {Loan, statusIcon} from "../../models/loan.model";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import {Router} from "@angular/router";
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-loans-table',
  imports: [
    NgxMaskPipe,
    NgOptimizedImage,
    MatMenu,
    MatMenuTrigger,
    NgIf,
    MatTooltip
  ],
  templateUrl: './loans-table.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansTableComponent {
  data = input<Loan[]>([]);
  @Input() pinLoan!: (value: string, pinned: boolean) => void;

  private router = inject(Router);
  public userService = inject(UserService);

  protected readonly Math = Math;
  protected readonly statusIcon = statusIcon;

  openDetail(event: Event, data: Loan) {
    event.stopPropagation();
    this.router.navigate(['/loans/details']);
    localStorage.setItem('loanData', JSON.stringify(data))
  }

  pinAction(item: Loan) {
    if (this.userService.hasAction('CREDITS')) {
      this.pinLoan(item.loanId, item.pinned)
    }
  }

  integerPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  openRepay(event: Event, account: number) {
    event.stopPropagation();
    this.router.navigate(['loans', account, 'repay']);
  }
}
