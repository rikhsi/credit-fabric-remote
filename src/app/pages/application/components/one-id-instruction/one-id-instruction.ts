import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { OneIdInstructionStep } from './components';
import { ONE_ID_INSTRUCTION_NOTE_AFTER_STEP, OneIdInstructionStep as OneIdInstructionStepData } from '@pages/application/data/one-id';
import { Card } from '@shared/components';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-one-id-instruction',
  imports: [Card, TranslocoDirective, NzButtonComponent, NzIconDirective, NzTypographyComponent, OneIdInstructionStep, BounceDirective],
  templateUrl: './one-id-instruction.html',
  styleUrl: './one-id-instruction.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneIdInstruction {
  readonly steps = input.required<OneIdInstructionStepData[]>();

  readonly back = output<void>();
  readonly goToOneId = output<void>();

  protected readonly noteAfterStep = ONE_ID_INSTRUCTION_NOTE_AFTER_STEP;
}
