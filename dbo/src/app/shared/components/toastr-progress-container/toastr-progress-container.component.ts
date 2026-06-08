import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastrProgressComponent } from '../toastr-progress/toastr-progress.component';
import { ToastrProgressService } from '../../services/toastr-progress.service';

@Component({
  selector: 'app-toastr-progress-container',
  imports: [CommonModule, ToastrProgressComponent],
  template: `
    <div class="relative">
      <div class="fixed top-18 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 flex items-end flex-col">
        @for (toast of toastService.visibleToasts(); track toast.id) {
          <app-toastr-progress
            [toast]="toast"
            (onRetry)="handleRetry($event)"
            (onRemove)="handleRemove($event)"
            (onMinimize)="handleMinimize($event)"
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ToastrProgressContainerComponent {
  public toastService = inject(ToastrProgressService);

  handleRetry(id: number) {
    const metadata = this.toastService.getMetadataAndRemove(id);
    
    if (!metadata) {
      console.warn('⚠️ Cannot retry - toast not found:', id);
      return;
    }

    console.log('🔄 Retry initiated for:', metadata.fileName);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('retry-download', { 
        detail: { metadata } 
      }));
    }, 50);
  }

  handleRemove(id: number) {
    this.toastService.removeToast(id);
  }

  handleMinimize(id: number) {
    this.toastService.minimizeToast(id);
  }
}