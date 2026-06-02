import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Card, LabelControlSecondary } from '@shared/components';
import { PhoneNumberPipe } from '@shared/pipes';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'cf-contact-info',
  imports: [Card, LabelControlSecondary, TranslocoDirective, PhoneNumberPipe],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactInfo {
  private readonly authService = inject(AuthService);

  readonly user = computed(() => this.authService.user());
}
