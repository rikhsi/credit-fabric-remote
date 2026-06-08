import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click';

@Component({
  selector: 'app-custom-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./custom-tooltip.component.html',
  styleUrl:'./custom-tooltip.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: '{{enterTransform}}',
          filter: 'blur(4px)'
        }),
        animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ 
            opacity: 1, 
            transform: 'scale(1) translateY(0) translateX(0)',
            filter: 'blur(0px)'
          })
        )
      ], { params: { enterTransform: 'scale(0.9) translateY(-10px)' } }),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0.0, 1, 1)', 
          style({ 
            opacity: 0, 
            transform: 'scale(0.95) translateY(-5px)',
            filter: 'blur(2px)'
          })
        )
      ])
    ])
  ]
})
export class CustomTooltipComponent {
  // Asosiy content
  @Input() message: string = '';
  @Input() title: string = 'Hamkor Bank';
  
  // Position va trigger
  @Input() position: TooltipPosition = 'above';
  @Input() trigger: TooltipTrigger = 'hover';
  
  // Width settings
  @Input() width: string = 'auto';
  @Input() minWidth: string = '200px';
  @Input() maxWidth: string = '400px';
  
  // Colors
  @Input() backgroundColor: string = '#FFF3EB';
  @Input() textColor: string = '#4a4a4a';
  @Input() titleColor: string = '#1a1a1a';
  @Input() closeButtonColor: string = '#666';
  @Input() arrowColor: string = '#FFF3EB';
  
  // Typography
  @Input() fontSize: string = '14px';
  @Input() lineHeight: string = '1.5';
  @Input() titleFontSize: string = '16px';
  @Input() titleFontWeight: string = '600';
  
  // Spacing
  @Input() padding: string = '16px';
  @Input() borderRadius: string = '12px';
  
  // Features
  @Input() showHeader: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() showArrow: boolean = true;
  @Input() autoHide: boolean = true;
  @Input() autoHideDelay: number = 0; // 0 = no auto hide
  
  isVisible = false;
  private autoHideTimeout?: number;

  onMouseEnter() {
    if (this.trigger === 'hover') {
      this.show();
    }
  }

  onMouseLeave() {
    if (this.trigger === 'hover' && this.autoHide) {
      this.hide();
    }
  }

  onClick() {
    if (this.trigger === 'click') {
      this.toggle();
    }
  }

  show() {
    this.isVisible = true;
    
    if (this.autoHideDelay > 0) {
      this.clearAutoHideTimeout();
      this.autoHideTimeout = window.setTimeout(() => {
        this.hide();
      }, this.autoHideDelay);
    }
  }

  hide() {
    this.isVisible = false;
    this.clearAutoHideTimeout();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private clearAutoHideTimeout() {
    if (this.autoHideTimeout) {
      window.clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = undefined;
    }
  }
}
