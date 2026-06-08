import {animate, animateChild, group, query, style, transition, trigger} from "@angular/animations";


export const routeAnimation = trigger('routeAnimations', [
  // transition(
  //   '* <=> *',
  //   [
  //     query(
  //       ':enter, :leave',
  //       [
  //         style({
  //           position: 'absolute',
  //           opacity: 1,
  //           transform: 'translate3d(0, 0, 0)',
  //           easing: 'ease',
  //           offset: 1,
  //           height: '100%',
  //           width: '100%'
  //         })
  //       ],
  //       { optional: true }
  //     ),
  //     query(
  //       ':enter',
  //       [
  //         style({
  //           position: 'absolute',
  //           visibility: 'visible',
  //           opacity: 0,
  //           transform: 'translate3d(0, 10%, 0)',
  //           easing: 'ease',
  //           offset: 0
  //         })
  //       ],
  //       { optional: true }
  //     ),
  //     query(':leave', animateChild(), { optional: true }),
  //     group([
  //       query(
  //         ':leave',
  //         [
  //           animate(
  //             '500ms ease-in',
  //             style({
  //               position: 'absolute',
  //               visibility: 'visible',
  //               opacity: 0,
  //               transform: 'translate3d(0, 5%, 0)',
  //               easing: 'ease',
  //               offset: 0
  //             })
  //           )
  //         ],
  //         { optional: true }
  //       ),
  //       query(
  //         ':enter',
  //         [
  //           animate(
  //             '500ms ease-out',
  //             style({
  //               position: 'absolute',
  //               opacity: 1,
  //               transform: 'translate3d(0, 0, 0)',
  //               easing: 'ease',
  //               offset: 1,
  //               height: '100%',
  //               width: '100%'
  //             })
  //           )
  //         ],
  //         { optional: true }
  //       )
  //     ])
  //   ],
  //   {
  //     params: {
  //       delay: 0,
  //       duration: 1000,
  //       translate: '100%'
  //     }
  //   }
  // )
]);
