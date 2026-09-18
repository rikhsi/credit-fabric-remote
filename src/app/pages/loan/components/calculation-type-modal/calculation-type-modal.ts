import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-calculation-type-modal',
  imports: [NzButtonComponent, TranslocoDirective, NzIconDirective, BounceDirective],
  templateUrl: './calculation-type-modal.html',
  styleUrl: './calculation-type-modal.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculationTypeModal {
  private readonly modalRef = inject(NzModalRef);

  close(): void {
    this.modalRef.close();
  }
}
