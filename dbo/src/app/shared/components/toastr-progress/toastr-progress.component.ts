import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Toast } from '../../services/toastr-progress.service';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-toastr-progress',
  imports: [CommonModule, SvgIconComponent, MatIconModule,TranslateModule],
  templateUrl: './toastr-progress.component.html',
  styles: ``,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      state('void', style({ transform: 'translateY(-20px)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })))
    ])
  ],
})
export class ToastrProgressComponent {
  @Input({ required: true }) toast!: Toast;
  @Output() onRetry = new EventEmitter<number>();
  @Output() onRemove = new EventEmitter<number>();
  @Output() onMinimize = new EventEmitter<number>();

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    if (bytes < k) return bytes + ' B';
    if (bytes < k * k) return (bytes / k).toFixed(1) + ' KB';
    return (bytes / (k * k)).toFixed(1) + ' MB';
  }

  getDownloadedSize(): string {
    return this.formatBytes(this.toast.downloadedBytes);
  }

  getTotalSize(): string {
    return this.formatBytes(this.toast.fileSize);
  }
}