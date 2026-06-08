import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToastrProgressService } from 'src/app/shared/services/toastr-progress.service';

@Component({
  selector: 'app-header-download-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toastService.activeDownloadsCount() > 0" class="relative" (click)="expandAll()" [class.cursor-pointer]="hasMinimized()">
      <div class="relative w-8 h-8 flex items-center justify-center">
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66667 0.833333C6.66667 0.373096 6.29357 0 5.83333 0C5.3731 0 5 0.373096 5 0.833333V10.4882L1.42259 6.91074C1.09715 6.58531 0.569515 6.58531 0.244078 6.91074C-0.0813592 7.23618 -0.0813592 7.76382 0.244078 8.08926L5.24408 13.0893C5.56952 13.4147 6.09715 13.4147 6.42259 13.0893L11.4226 8.08926C11.748 7.76382 11.748 7.23618 11.4226 6.91074C11.0972 6.58531 10.5695 6.58531 10.2441 6.91074L6.66667 10.4882V0.833333Z" fill="#00A38D"/>
        </svg>

        @if (toastService.activeDownloadsCount() > 0) {
          <div @fadeIn class="absolute -top-2 -right-2 bg-[#00A38D] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {{ toastService.activeDownloadsCount() }}
          </div>
        }

        @if (toastService.activeDownloadsCount() === 1 && getActiveDownload()) {
          <svg @fadeIn class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#00A38D"
              stroke-width="2"
              [style.stroke-dasharray]="getCircumference()"
              [style.stroke-dashoffset]="getProgressOffset()"
              stroke-linecap="round"
              class="transition-all duration-300"
            />
          </svg>
        }
      </div>

      @if (toastService.minimizedCount() > 0) {
        <div class="absolute bottom-full right-0 mb-2 hidden z-50">
          <div class="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            {{ toastService.activeDownloadsCount() }} файл загружается
            <div class="absolute top-full right-4 -mt-1">
              <div class="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ]
})
export class HeaderDownloadIndicatorComponent {
  public toastService = inject(ToastrProgressService);

  hasMinimized(): boolean {
    return this.toastService.minimizedCount() > 0;
  }

  getActiveDownload() {
    return this.toastService.minimizedToasts()
      .find(t => t.status === 'downloading');
  }

  getCircumference(): string {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    return `${circumference} ${circumference}`;
  }

  getProgressOffset(): number {
    const download = this.getActiveDownload();
    if (!download) return 0;
    
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (download.progress / 100) * circumference;
    return offset;
  }

  expandAll() {
    if (this.hasMinimized()) {
      this.toastService.maximizeAll();
    }
  }
}