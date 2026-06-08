// highlight.directive.ts
import { 
  Directive, 
  ElementRef, 
  Input, 
  OnChanges, 
  SimpleChanges, 
  AfterViewInit,
  OnDestroy
} from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges, AfterViewInit, OnDestroy {
  @Input() appHighlight: string = '';
  @Input() highlightClass: string = 'bg-yellow-300';
  
  private observer?: MutationObserver;
  private initialized = false;
  private isHighlighting = false;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initialized = true;
    
    setTimeout(() => this.highlight(), 0);

    this.setupMutationObserver();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appHighlight'] && this.initialized) {
      this.highlight();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupMutationObserver(): void {
    const element = this.el.nativeElement;
    
    this.observer = new MutationObserver((mutations) => {
      if (!this.isHighlighting) {
        setTimeout(() => this.highlight(), 0);
      }
    });

    this.observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  private getCleanText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    const marks = clone.querySelectorAll('mark');
    marks.forEach(mark => {
      const text = document.createTextNode(mark.textContent || '');
      mark.parentNode?.replaceChild(text, mark);
    });
    return clone.textContent || '';
  }

  private highlight(): void {
    this.isHighlighting = true;
    const element = this.el.nativeElement;
    
    const originalText = this.getCleanText(element);
    
    if (!this.appHighlight || this.appHighlight.trim() === '' || !originalText) {
      if (element.innerHTML.includes('<mark')) {
        element.textContent = originalText;
      }
      this.isHighlighting = false;
      return;
    }

    const searchTerm = this.appHighlight.trim();
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    
    if (regex.test(originalText)) {
      const highlightedText = originalText.replace(
        regex,
        `<mark class="${this.highlightClass}">$1</mark>`
      );
      element.innerHTML = highlightedText;
    } else {
      element.textContent = originalText;
    }
    
    this.isHighlighting = false;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

