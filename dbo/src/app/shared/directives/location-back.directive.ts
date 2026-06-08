import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
  selector: '[appLocationBack]',
  standalone: true
})
export class LocationBackDirective {

  constructor(
    private location: Location,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
  }

  @HostListener('click')
  onClick(): void {
    this.location.back();
  }
}
