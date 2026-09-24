import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NgOptimizedImage } from '@angular/common';
import { BounceDirective } from '@shared/directives';
import { ImagePipe } from '@shared/pipes';
import { BANK_BRANCHES_URL } from '@app/constants/loan';

@Component({
  selector: 'cf-application-sent-modal',
  imports: [NzButtonComponent, TranslocoDirective, NzIconDirective, BounceDirective, NgOptimizedImage, ImagePipe],
  templateUrl: './application-sent-modal.html',
  styleUrl: './application-sent-modal.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSentModal {
  private readonly modalRef = inject(NzModalRef);

  close(): void {
    this.modalRef.close(false);
  }

  findBranch(): void {
    window.open(BANK_BRANCHES_URL, '_blank', 'noopener,noreferrer');
    this.modalRef.close(true);
  }
}
