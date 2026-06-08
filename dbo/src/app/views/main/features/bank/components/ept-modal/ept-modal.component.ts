import { ChangeDetectionStrategy, Component, DestroyRef, Inject } from '@angular/core';
import { EptService } from '../../../../../../core/services/ept.service';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { EptDoc, EptOperation } from '../../interfaces/ept.interface';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';
import { AmountService } from '../../../../../../core/services/amount.service';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { operationColumns } from '../../constants/table-columns';

@Component({
    selector: 'app-ept-modal',
    imports: [
        MatDialogClose,
        MatIcon,
        MatRipple,
        ContainerTableComponent
    ],
    templateUrl: './ept-modal.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EptModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { ept: EptDoc, operations: EptOperation[] },
    private destroyRef: DestroyRef,
    private eptService: EptService,
    public amountService: AmountService,
  ) {
  }

  protected readonly operationColumns = operationColumns;
}
