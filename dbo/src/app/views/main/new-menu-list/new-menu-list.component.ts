import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal
} from '@angular/core';
import {NewMenuList} from "../menu-list/models/menu-list.model";
import {NavigationStart, Router, RouterLink} from "@angular/router";
import {UtilsService} from "../../../core/services/utils.service";
import {UserService} from "../../../core/services/user.service";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatTooltip} from "@angular/material/tooltip";
import {NewMenuItemComponent} from "./components/new-menu-item/new-menu-item.component";
import {NewSubmenuItemComponent} from "./components/new-submenu-item/new-submenu-item.component";
import {AgreeDialogComponent} from "../../../core/components/agree-dialog/agree-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { ThemeToggleComponent } from 'src/app/theme-toggle.component';
import { NewSettingsService } from '../features/new-settings/services/new-settings.service';
import { take } from 'rxjs';


@Component({
  selector: 'app-new-menu-list',
  imports: [
    NgClass,
    MatTooltip,
    RouterLink,
    TranslateModule,
    AsyncPipe,
    // RouterLinkActive,
    NewMenuItemComponent,
    NgIf,
    NewSubmenuItemComponent,
    ThemeToggleComponent
  ],
  templateUrl: './new-menu-list.component.html',
  styles: ``,
  styleUrls: ['./new-menu-list.components.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewMenuListComponent implements OnInit{
  private _dialog = inject(MatDialog)
  readonly #destroy = inject(DestroyRef)
  private readonly router = inject(Router)
  protected readonly utilsService = inject(UtilsService)
  private readonly _cdRef  = inject(ChangeDetectorRef)
  readonly userService = inject(UserService)
  private readonly newSettingsService = inject(NewSettingsService)
  subMenu = signal<boolean>(true)
  isCheckedTheme = signal<boolean>(false)
  permissionsList = signal<{ module: string, types: [string] }[]>([]);
  settingsSubMenu = signal<boolean>(true);
  businessInfo = signal<any>({});
  toggleMenu = output<boolean>();
  miniVariant = signal<boolean>(false);
  isProd = signal<boolean>(false);
  prodHosts = [
    'biznes.hamkorbank.uz',
    'corp.hamkorbank.uz'
  ];
  mainMenuList: NewMenuList[] = [
    {
      title: 'Главная',
      icon: 'home',
      link: 'main',
      permissions: ['ALL'],
      titleKey:'main.home'
    },
    {
      title: 'Платежи',
      isHeader: true, // heading
      titleKey:'main.payments'
    },
    {
      title: 'Создать платеж',
      icon: 'create-payment',
      link: 'payment',
      permissions: ['ALL'],
      titleKey:'main.create_payment'
    },
    {
      title: 'История',
      icon: 'clock',
      link: 'history',
      permissions: ['ALL'],
      titleKey:'main.history'
    },
    {
      title: 'Счета',
      icon: 'payment-requests',
      link: 'accounts',
      permissions: ['ACCOUNTS'],
      titleKey:'main.accounts'
    },

    {
      title: 'Карты',
      icon: 'card',
      link: 'corp-card-project',
      permissions: ['CARDS'],
      titleKey:'main.cards'
    },
    {
      title: 'Зарплатные  проект',
      icon: 'salary',
      link: 'payroll-project',
      permissions: ['SALARY'],
      titleKey:'salaryStatements.payroll_project'
    },
    // {
    //   title: 'Платежные требования',
    //   icon: 'payment-requests',
    //   link: 'applications',
    //   permissions: ['APPLICATION'],
    //   titleKey:'main.payment_requests'
    // },
    {
      title: 'Продукты',
      isHeader: true, // heading
      titleKey:'main.products'
    },
    {
      title: 'Депозиты',
      icon: 'deposit',
      link: 'deposits',
      permissions: ['DEPOSITS'],
      titleKey:'main.deposits'
    },

    //    {
    //   title: 'Кредиты ',
    //   icon: 'loan',
    //   link: 'loans',
    //   permissions: ['CREDITS'],
    //   titleKey:'main.loans'
    // },
    {
      title: 'Кредиты ',
      icon: 'loan',
      link: 'loan',
      permissions: ['CREDITS'],
      titleKey:'Кредиты'
    },
    // {
    //   title: 'ВЭД',
    //   isHeader: true,
    //   titleKey:'main.ved'
    // },
    // {
    //   title: 'Конверсия',
    //   icon: 'conversion',
    //   link: 'ved-conversion',
    //   permissions: ['ALL'],
    //   titleKey:'main.conversion'
    // },
    // {
    //   title: 'Покупка/продажа валюты',
    //   icon: 'conversion',
    //   link: 'conversion',
    //   permissions: ['CREDITS'],
    //   titleKey:'Покупка/продажа валюты'
    // },
    {
      title: 'Другое',
      isHeader: true, // heading
      titleKey:'main.other'
    },
    // {
    //   title: 'Выписки',
    //   icon: 'extracts',
    //   link: 'charts',
    //   permissions: ['STATEMENTS'],
    //   titleKey:'main.statements'
    // },
    {
      title: 'Выписки',
      icon: 'extracts',
      link: 'reports',
      permissions: ['STATEMENTS'],
      titleKey:'main.statements'
    },
    {
      title: 'Настройки',
      icon: 'settings',
      permissions: ['ALL'],
      link: 'settings',
      // permissions: ['ACCOUNT', 'PAYMENT'],
      titleKey:'main.settings',
      subMenuList: [
        {
          title: 'Профиль',
          icon: 'my-profile',
          link: 'settings/my-profile',
          permissions: [],
          titleKey:'main.profile'
        },
        {
          title: 'Организация',
          icon: 'organization',
          link: 'settings/organization',
          permissions: [],
          titleKey:'settings.organization'
        },
        {
          title: 'Пользователи ',
          icon: 'users',
          link: 'settings/users',
          permissions: [],
          titleKey:'settings.users'
        },
        {
          title: 'ЭЦП',
          icon: 'key',
          link: 'settings/e-signature',
          permissions: [],
          titleKey:'settings.eds'
        },
        {
          title: 'Уведомления',
          icon: 'notifications',
          link: 'settings/notifications',
          permissions: [],
          titleKey:'settings.notifications'
        },
        {
          title: 'Безопасность и вход',
          icon: 'shield',
          link: 'settings/security',
          permissions: [],
          titleKey:'settings.security_and_login'
        },
        // {
        //   title: 'Маршруты',
        //   icon: 'routers',
        //   link: 'settings/routers',
        //   permissions: [],
        //   titleKey:"Маршруты"
        // },
        {
          title: 'Справочники',
          icon: 'references',
          link: 'settings/bank-info',
          permissions: [],
          titleKey:'settings.directories'
        },
        {
          title: 'Оферта',
          icon: 'new-public-offer',
          link: 'settings/new-public-offer',
          permissions: [],
          titleKey:'settings.public_offer'
        }
      ],

    },
    {
      title: 'Платёжные требования',
      icon: 'new-folder',
      link: 'EPT',
      permissions: ['KARTOTEKA'],
      titleKey : 'Платёжные требования'
    },
    {
      title: 'Картотека 1',
      icon: 'folder',
      link: 'kartoteka-1',
      permissions: ['KARTOTEKA'],
      titleKey : 'Картотека 1'
    },
    {
      title: 'Картотека 2',
      icon: 'folder',
      link: 'kartoteka-2',
      permissions: ['KARTOTEKA'],
      titleKey : 'cardFileTwo.card_index_2'
    },


    // {
    //   title: 'Гарантии',
    //   icon: 'shield',
    //   link: 'guarantees',
    //   titleKey:'Гарантии'
    // },
    // {
    //   title: 'Безопасность',
    //   icon: 'lock',
    //   link: '/security',
    //   titleKey:'settings.security'
    // },
    // {
    //   title: 'Вопросы и ответы',
    //   icon: 'faq-chat',
    //   link: '/chat/faq',
    //   titleKey:'Вопросы и ответы'
    // },
    // {
    //   title: 'Переписка с оператором',
    //   icon: 'faq-conversation',
    //   link: '/chat/conversation',
    //   titleKey:'Переписка с оператором'
    // },
  ];

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const info =  localStorage.getItem('businessInfo');
    if (info) {
      this.businessInfo.set(JSON.parse(info))
    }
    this.isProd.set(this.prodHosts.includes(window.location.hostname))
    const permissions = this.userService.getPermissions();
    if (permissions) {
      this.permissionsList.set(JSON.parse(permissions));
    }

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
           this.subMenu.set((event?.url?.split('/')[1] === 'settings') ? false : true);
           this.settingsSubMenu.set((event?.url?.split('/')[1] === 'settings') ? false : true);
      }
    });



    this.updateMenu()
  }

  requestPermissions(permissionNames: string[] | undefined): boolean {
    if (permissionNames?.includes('ALL')) {
      return true;
    } else if (permissionNames !== undefined) {
      return this.permissionsList()?.some(
        (permission) => permissionNames.includes(permission.module)
      );
    } else {
      return false;
    }
  }

  activeMenuClass = `
  active-menu
  before:content-['']
  before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
  before:w-[4px] before:h-[20px] before:bg-[#008C79]
  before:rounded-r-md relative pr-2
`;

  updateMenu() {
    const userLocalData = this.userService.getUserLocalData();
    if (!userLocalData) return;
    const user = JSON.parse(userLocalData);
    if(!user || !user?.permissionWindows) return;
    const permissions = user.permissionWindows;

    const permissionSet = new Set(permissions);

    this.mainMenuList = this.mainMenuList.filter(item => {
      if (item.permissions === undefined) return true;
      return [...item.permissions].some(val => permissionSet.has(val));
    });

    this._cdRef.detectChanges();
  }

  openRoute(item: any) {
    if(!item?.disabled)
      this.router.navigate([item.link])
  }

  openPublicOffer(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.newSettingsService
      .downloadPolicyIframe({ type: 'PRIVACY_POLICY' })
      .pipe(take(1), takeUntilDestroyed(this.#destroy))
      .subscribe({
        next: (link) => {
          if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
          }
        },
      });
  }

  onToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isCheckedTheme.set(checked);
  }

 isRouteActive(prefix: string | undefined): boolean {
  if(!prefix)  return false
  return this.router.url.startsWith(`/${prefix}`);
 }

  logout() {
    const dialog = this._dialog.open(AgreeDialogComponent, {
      data: {
        title:  `${this.translate.instant('new_second.logout')}` ,
        text: `${this.translate.instant('new_second.are_you_sure_you_want_to_log_out')}`,
        isMatIcon: false,
        icon: 'hamkor_logout-03',
        iconColor: 'red'
      },
    });

    dialog.afterClosed()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        if (res === 'success') {
          this.userService.logout();
        }
      });
  }

  protected readonly window = window;
}
