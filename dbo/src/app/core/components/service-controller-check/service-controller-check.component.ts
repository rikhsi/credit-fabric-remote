import {
  Component,
    DestroyRef,
    OnDestroy,
    inject,
    effect
} from '@angular/core';

import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../services/notification.service';
import {
  animate,
  transition,
  trigger,
  style,
  keyframes
} from '@angular/animations';
import { ServiceControllerStore } from './service-controller.store';
import {NavigationStart, Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-service-controller-check',
  standalone: true,
  imports: [NgIf],
  templateUrl: './service-controller-check.component.html',
  animations: [
    trigger('iconScale', [
      transition(':enter', [
        animate(
          '350ms ease-out',
          keyframes([
            style({ transform: 'scale(0.3)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1)', opacity: 1, offset: 1 })
          ])
        )
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('emergeAndExpand', [
      transition(':enter', [
        animate(
          '500ms ease-out',
          keyframes([
            style({
              transform: 'scaleX(0.05) scaleY(0.5)',
              opacity: 0,
              filter: 'blur(6px)',
              offset: 0
            }),
            style({
              transform: 'scaleX(0.5) scaleY(0.7)',
              opacity: 1,
              filter: 'blur(3px)',
              offset: 0.5
            }),
            style({
              transform: 'scaleX(0.8) scaleY(1)',
              opacity: 1,
              filter: 'blur(0)',
              offset: 0.8
            }),
            style({
              transform: 'scaleX(1) scaleY(1)',
              opacity: 1,
              filter: 'blur(0)',
              offset: 1
            })
          ])
        )
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({
            transform: 'scaleX(0) scaleY(0.5)',
            opacity: 0,
            filter: 'blur(6px)'
          })
        )
      ])
    ])
  ]
})
export class ServiceControllerCheckComponent implements OnDestroy {

  private destroyRef = inject(DestroyRef);
  private notificationService = inject(NotificationService);
  store = inject(ServiceControllerStore);
  private router = inject(Router);
  private userService = inject(UserService);

  token = this.userService.getToken();


  private timeoutId: any;

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.store.clear();
      }
    });
  }

  servicesEffect = effect(() => {
    const services = this.store.services();

    if (!this.token) return;

    this.notificationService
      .checkServiceController(services)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        console.log("BINGO RES",res)
        if(res == null) return;
        if (res.isActive) {
          this.store.errorMessage.set(null);
          return;
        }

        this.store.iconContent.set(true);

        this.timeoutId = setTimeout(() => {
          this.store.iconContent.set(false);
          this.store.errorMessage.set(res.message);
        }, 450);
      });
  });

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
