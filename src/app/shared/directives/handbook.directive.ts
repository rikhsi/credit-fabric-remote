import { Directive, TemplateRef, ViewContainerRef, input, effect } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { TableOverview } from '@api/models/base';
import { HandbookContext, HandbookItem, HandbookRequest } from '@typings';
import { QUEUE_TYPE, USE_HTTP_CACHE } from '@constants';
import { buildHttpParams } from '@api/utils';

@Directive({
  selector: '[cfHandbook]',
})
export class HandbookDirective<T = HandbookItem> {
  public readonly handbookItem = input<HandbookRequest>(null, { alias: 'cfHandbook' });

  private context: HandbookContext<T> = {
    $implicit: [],
  };

  constructor(
    private templateRef: TemplateRef<HandbookContext<T>>,
    private viewContainer: ViewContainerRef,
    private http: HttpClient,
  ) {
    effect(() => this.loadData());
  }

  private loadData() {
    const { url, params } = this.handbookItem();

    this.http
      .get<TableOverview<T>>(url, {
        context: new HttpContext().set(QUEUE_TYPE, 'handbook').set(USE_HTTP_CACHE, true),
        params: buildHttpParams(params ?? {}),
      })
      .subscribe((res) => {
        this.context.$implicit = res.data;

        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef, this.context);
      });
  }
}
