import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { HandbookApiService } from '@api/controllers/handbooks';
import { HandbookItem, HandbookRequest, HandbookContext } from '@app/typings/handbook';

@Directive({
  selector: '[cfHandbook]',
})
export class HandbookDirective<T extends HandbookItem = HandbookItem> {
  private readonly handbookApi = inject(HandbookApiService);

  public readonly handbookItem = input<HandbookRequest>(null, { alias: 'cfHandbook' });

  private context: HandbookContext<T> = {
    $implicit: [],
  };

  constructor(
    private templateRef: TemplateRef<HandbookContext<T>>,
    private viewContainer: ViewContainerRef,
  ) {
    effect((onCleanup) => {
      const request = this.handbookItem();

      if (!request?.type) {
        this.context.$implicit = [];
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef, this.context);
        return;
      }

      const subscription = this.handbookApi.getAll$<T>(request.type, request.params ?? {}).subscribe((items) => {
        this.context.$implicit = items;
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef, this.context);
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
