import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { InfoModalData } from '@app/typings/modal';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-info-modal',
  imports: [NzButtonComponent, TranslocoDirective, NzIconDirective, BounceDirective],
  templateUrl: './info-modal.html',
  styleUrl: './info-modal.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoModal {
  private readonly modalRef = inject(NzModalRef);

  public readonly config = inject<InfoModalData>(NZ_MODAL_DATA);

  close(): void {
    this.modalRef.close();
  }
}
