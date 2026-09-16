import { Directive, effect, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { OnlineStartProcessingAddress } from '@api/models/los/start-processing';

@Directive({
  selector: '[cfResetVillageOnCityChange]',
})
export class ResetVillageOnCityChangeDirective {
  readonly form = input.required<FieldTree<OnlineStartProcessingAddress>>({ alias: 'cfResetVillageOnCityChange' });

  private previousCityId: string;

  constructor() {
    effect(() => {
      const cityId = this.form().dirCityId().value();

      if (this.previousCityId !== undefined && cityId !== this.previousCityId) {
        this.form().dirVillageId().value.set(null);
      }

      this.previousCityId = cityId;
    });
  }
}
