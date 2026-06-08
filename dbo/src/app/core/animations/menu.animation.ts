import { animate, query, sequence, stagger, style, transition, trigger } from '@angular/animations';

export const DropDownAnimation = trigger("dropDownMenu", [
  transition(":enter", [
    style({ height: 0, overflow: "hidden" }),
    query(".menu-item", [
      style({ opacity: 0, transform: "translateY(-50px)" })
    ]),
    sequence([
      animate("100ms", style({ height: "*" })),
      query(".menu-item", [
        stagger(-50, [
          animate("200ms ease", style({ opacity: 1, transform: "none" }))
        ])
      ])
    ])
  ]),

  transition(":leave", [
    style({ height: "*", overflow: "hidden" }),
    query(".menu-item", [style({ opacity: 1, transform: "none" })]),
    sequence([
      query(".menu-item", [
        stagger(50, [
          animate(
            "200ms ease",
            style({ opacity: 0, transform: "translateY(-50px)" })
          )
        ])
      ]),
      animate("100ms", style({ height: 0 }))
    ])
  ])
]);
export const slideInOutAnimation = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }))
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0%)', opacity: 1 }),
    animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
  ])
]);
