import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BounceDirective } from '@shared/directives';
import { ToastService } from '@core/services/toast.service';
import { ToastItem } from '@app/typings/toast';

@Component({
  selector: 'cf-toast-host',
  imports: [NzIconModule, BounceDirective],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHost {
  private readonly toast = inject(ToastService);

  readonly items = this.toast.items;

  dismiss(item: ToastItem): void {
    this.toast.dismiss(item.id);
  }

  iconType(type: ToastItem['type']): string {
    return type === 'success' ? 'check-circle' : 'exclamation-circle';
  }
}
