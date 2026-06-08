import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { ILoanProduct } from '../../../views/main/features/loans/models/loan.model';

@Component({
    selector: 'app-loan-header',
    imports: [
        NgIf,
        NgxMaskPipe
    ],
    templateUrl: './loan-header.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanHeaderComponent {
  @Input() loan!: ILoanProduct;
}
