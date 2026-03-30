import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  set hide(value: boolean) {
    const splash = this.document.querySelector('.splash');

    if (!splash) return;

    if (value) {
      this.renderer.addClass(splash, 'none');
    } else {
      this.renderer.removeClass(splash, 'none');
    }
  }
}
