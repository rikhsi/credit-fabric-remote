import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { ApprovedModal, CardApplication } from './components';
import { ApplicationsService } from './services';
import { EmptyListPipe } from '@shared/pipes';
import { Empty, ModalConfirmComponent } from '@shared/components';
import { ConfirmModal } from '@app/typings/modal';

@Component({
  selector: 'cf-applications',
  imports: [CardApplication, NzSkeletonModule, EmptyListPipe, Empty, TranslocoDirective],
  templateUrl: './applications.html',
  styleUrl: './applications.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApplicationsService],
})
export class Applications implements OnInit {
  private applicationService = inject(ApplicationsService);
  private destroyRef = inject(DestroyRef);
  private nzModalService = inject(NzModalService);

  readonly isLoading = computed(() => this.applicationService.isLoading());
  readonly items = computed(() => this.applicationService.applicationsList());

  ngOnInit(): void {
    this.applicationService.getApplications$().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  declined(): void {
    this.nzModalService.create<ModalConfirmComponent, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ModalConfirmComponent,
      nzData: {
        icon: 'close',
        title: 'modal.application_decline.title',
        description: 'modal.application_decline.description',
        submit: {
          title: 'action.continue',
          danger: false,
        },
        cancel: {
          title: 'action.decline_yes',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }

  approved(): void {
    this.nzModalService.create<ApprovedModal, ConfirmModal, boolean>({
      nzTitle: null,
      nzClosable: false,
      nzCloseIcon: null,
      nzContent: ApprovedModal,
      nzData: {
        title: 'modal.application_approved.title',
        description: 'modal.application_approved.description',
        submit: {
          title: 'action.close',
          danger: false,
        },
      },
      nzCentered: true,
      nzFooter: null,
      nzWidth: 'auto',
    });
  }
}
