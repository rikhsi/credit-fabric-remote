import {ChangeDetectionStrategy, Component, inject, input, OnChanges, output, signal, SimpleChanges} from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {NgxMaskPipe} from "ngx-mask";
import {Loan} from "../../../loans/models/loan.model";
import {ThemeService} from "../../../../../../shared/services/theme.service";
import { MatMenuModule } from '@angular/material/menu';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { LoanLogicService } from '../../../loan/services/loan-logic.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoanService } from '../../../loans/services/loan.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-credits',
  imports: [
    NgIf,
    NgxMaskPipe,
    NgOptimizedImage,
    MatMenuModule,
    SvgIconComponent,
    TranslateModule

  ],
  providers:[
    LoanLogicService
  ],
  templateUrl: './credits.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditsComponent  {
  credits  = input<Loan[]>()
  pinLoan = output<Loan>()
  theme = inject(ThemeService)
  loanLogicService = inject(LoanLogicService)
  userService = inject(UserService)
  
  readonly loadApi  = inject(LoanService);
  selectedLoan = signal<Loan | null>(null)



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


   pinAction(item:any) {
     if (this.userService.hasAction('CREDITS')) {
      this.pinLoan.emit(item)
    }
  }






}
