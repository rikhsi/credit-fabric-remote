import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {AsyncPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../../../../../core/services/user.service";
import { positions } from '../../../../../../shared/types/role.type';
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {UserInfoDto, UserInfoDtoV2} from "../../../../../../core/models/user.model";

@Component({
    selector: 'app-me',
    imports: [
        AsyncPipe,
        ContainerNavComponent,
        ContainerTitleComponent,
        NgForOf,
        NgIf,
        NgClass
    ],
    templateUrl: './me.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeComponent implements OnInit {
  userInfo = signal<UserInfoDto| null>(null)
  profileTabs = signal<string[]>(['Профиль', 'Настройки'])
  activeMe = signal<number>(0)
  navs = signal([
    {
      title: 'Главная',
      link: '/main'
    },
    {
      title: 'Профиль и настройки',
      link: ''
    },
  ]);
constructor(public userService:UserService, private _authService: AuthService) {
}
  getUserInfo() {
    this._authService.getUserInfoV2()
      .pipe(take(1))
      .subscribe(res => {
        this.userInfo.set(res);
      });
  }

  ngOnInit(): void {
    this.getUserInfo();
  }
  getPositionLabel(position: string) {
    return positions[position];
  }

}
