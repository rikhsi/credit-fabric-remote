import { animate, style, transition, trigger } from '@angular/animations';

export const InOutPaneAnimations = trigger("inOutPaneAnimation", [
  transition(":enter", [
    style({ opacity: 0, transform: "translateX(100%)" }),
    animate(
      "500ms ease-in-out",
      style({ opacity: 1, transform: "translateX(0)" })
    )
  ]),
  transition(":leave", [
    style({ opacity: 1, transform: "translateX(0)" }),
    animate(
      "300ms ease-in-out",
      style({ opacity: 0, transform: "translateX(100%)" })
    )
  ])
])
