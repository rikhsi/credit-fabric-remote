import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzOptionComponent } from 'ng-zorro-antd/select';
import { FormBox, InputDefault, SelectDefault } from '@shared/components';
import { HandbookDirective } from '@shared/directives';

@Component({
  selector: 'cf-finance-form',
  imports: [FormBox, InputDefault, SelectDefault, NzOptionComponent, TranslocoDirective, HandbookDirective],
  templateUrl: './finance-form.html',
  styleUrl: './finance-form.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceForm {
  private modalRef = inject(NzModalRef);

  onSubmit(): void {
    this.modalRef.close(true);
  }

  onClose(): void {
    this.modalRef.close(false);
  }
}
