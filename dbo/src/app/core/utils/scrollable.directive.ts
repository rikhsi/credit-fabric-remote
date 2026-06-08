import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appScrollable]',
  standalone: true
})
export class ScrollableDirective {
  private _isDragging = false;
  private _startX = 0;
  private _startY = 0;

  public constructor(private _elementRef: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  private onMouseDown(event: MouseEvent): void {
    // Check if the event target is the draggable element itself or a child element
    if (
      event.target === this._elementRef.nativeElement ||
      this._elementRef.nativeElement.contains(event.target)
    ) {
      event.preventDefault(); // Prevent the default click event from firing
      this._isDragging = true;
      this._startX = event.clientX;
      this._startY = event.clientY;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  private onMouseMove(event: MouseEvent): void {
    if (this._isDragging) {
      const deltaX = event.clientX - this._startX;
      const deltaY = event.clientY - this._startY;
      this._elementRef.nativeElement.scrollLeft -= deltaX;
      this._elementRef.nativeElement.scrollTop -= deltaY;
      this._startX = event.clientX;
      this._startY = event.clientY;
      this._elementRef.nativeElement.style.cursor = 'grabbing';
      event.preventDefault();
    }
  }

  @HostListener('mouseleave')
  private onMouseLeave(): void {
    this.disableDragging();
  }

  @HostListener('mouseup')
  private onMouseUp(): void {
    this.disableDragging();
  }

  private disableDragging(): void {
    this._isDragging = false;
    this._elementRef.nativeElement.style.cursor = 'grab';
  }
}
