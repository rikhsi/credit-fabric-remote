import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCheckboxComponent } from 'ng-zorro-antd/checkbox';
import { AgreementFormModel } from '@pages/loan/models';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-product-acception',
  imports: [NzCheckboxComponent, NzButtonComponent, TranslocoDirective, FormField, BounceDirective],
  templateUrl: './product-acception.html',
  styleUrl: './product-acception.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAcception {
  public readonly form = input<FieldTree<AgreementFormModel>>();
  public readonly isSubmitting = input(false);

  clicked = output<boolean>();

  private readonly submitted = signal(false);

  readonly showOfferError = computed(() => this.submitted() && this.form()?.offer().value() !== true);

  apply(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.submitted.set(true);
    this.form()?.offer().markAsDirty();
    this.clicked.emit(true);
  }
}
