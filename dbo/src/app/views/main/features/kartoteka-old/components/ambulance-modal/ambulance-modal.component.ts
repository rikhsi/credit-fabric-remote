import { ChangeDetectionStrategy, Component, DestroyRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { AmountService } from '../../../../../../core/services/amount.service';
import { bookingOperationColumns } from '../../constants/table-columns';
import { NgIf } from '@angular/common';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-ambulance-modal',
    imports: [
        NgIf,
        ContainerTableComponent,
        MatIcon,
        MatRipple,
        MatDialogClose
    ],
    templateUrl: './ambulance-modal.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmbulanceModalComponent {
  historyData = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private destroyRef: DestroyRef,
    public amountService: AmountService,
  ) {
  }

  protected readonly operationColumns = bookingOperationColumns;
}
