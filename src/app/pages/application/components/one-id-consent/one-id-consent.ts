import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Card, Steps } from '@shared/components';
import { BounceDirective } from '@shared/directives';
import { ImagePipe } from '@shared/pipes';

@Component({
  selector: 'cf-one-id-consent',
  imports: [Card, Steps, TranslocoDirective, NzButtonComponent, NzTypographyComponent, BounceDirective, ImagePipe],
  templateUrl: './one-id-consent.html',
  styleUrl: './one-id-consent.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneIdConsent {
  readonly loading = input<boolean>(false);

  readonly grant = output<void>();
  readonly openInstruction = output<void>();
}
