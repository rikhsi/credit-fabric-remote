import { trigger, transition, style, animate } from '@angular/animations';

export const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' })),
  ]),
]);
