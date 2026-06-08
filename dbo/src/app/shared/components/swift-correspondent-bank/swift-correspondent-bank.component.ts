import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input } from '@angular/core';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionPanel } from '@angular/material/expansion';
import { TabsComponent } from '../tabs/tabs.component';
import { ITab } from '../../interfaces/tab.interface';
import { NgClass } from '@angular/common';
import { SearchableComponent } from '../../../core/components/searchable/searchable.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OperationsService } from '../../../views/main/features/operations/services/operations.service';
import { MatLabel } from '@angular/material/select';
import { BankComponent } from '../bank/bank.component';

@Component({
    selector: 'app-swift-correspondent-bank',
    imports: [
        MatInput,
        MatCheckbox,
        FormsModule,
        MatAccordion,
        MatExpansionPanel,
        TabsComponent,
        NgClass,
        SearchableComponent,
        MatFormField,
        MatLabel,
        BankComponent,
    ],
    templateUrl: './swift-correspondent-bank.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwiftCorrespondentBankComponent {
  @Input() openPanel = false;
  @Input() parentForm!: FormGroup;
  @Input() bicControlName = '';
  @Input() label = 'SWIFT code';
  @Input() bankAccount = '';
  @Input() bankName = '';
  @Input() bankAddress = '';

  @Input() bicValue = '';
}
