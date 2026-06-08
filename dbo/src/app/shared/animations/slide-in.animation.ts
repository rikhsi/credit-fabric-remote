import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const slideInAnimation = trigger('slideIn', [
  transition(':enter', [
    query(':self', [
      style({ transform: 'translateX(100%)', opacity: 0 }),
      stagger(200, [
        animate('200ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ], { optional: true })
  ]),
]);
