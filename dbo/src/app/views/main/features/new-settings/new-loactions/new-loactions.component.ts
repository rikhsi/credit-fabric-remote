import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { SettingsService } from '../../settings/services/settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgClass, NgForOf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {debounceTime} from "rxjs";

declare const ymaps: any;

const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];
const DEFAULT_MAP_ZOOM = 12;

@Component({
  selector: 'app-new-loactions',
  standalone: true,
  templateUrl: './new-loactions.component.html',
  imports: [NgForOf, TranslateModule, NgClass, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewLoactionsComponent implements OnInit {
  #destroy = inject(DestroyRef)
  private readonly settings = inject(SettingsService);
  readonly destroy = inject(DestroyRef);
  search = new FormControl('');
  activeTabIndex = signal<number>(1);
  banchList = signal<any[]>([]);
  atmList = signal<any[]>([]);
  loactionList = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  private geoObjects: any;
  private map: any;

  tabMenu = [
    { id: 1, name: this.translateService.instant('authorization.branches') },
    { id: 2, name: this.translateService.instant('new.atms') },
  ];
  activeLocation = signal<string>("");
  constructor(
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.search.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.#destroy)
    ).subscribe(value => {
      const searchValue = value?.toLowerCase() ?? '';

      this.loadData()
    });
    setTimeout(() => {
      ymaps.ready(() => {
        this.map = new ymaps.Map('yandex-map', {
          center: TASHKENT_CENTER,
          zoom: DEFAULT_MAP_ZOOM,
          controls: []
        },
          {
            suppressMapOpenBlock: true,
            copyrightLogoVisible: false,
            copyrightProvidersVisible: false,
            copyrightUaVisible: false
          });

        this.geoObjects = new ymaps.GeoObjectCollection();
        this.map.geoObjects.add(this.geoObjects);
        const zoomControl = new ymaps.control.ZoomControl({
          options: {
            size: 'small',
            position: { right: 20, top: 100 }
          }
        });

        const geoControl = new ymaps.control.GeolocationControl({
          options: {
            position: { right: 20, top: 180 }
          }
        });

        this.map.controls.add(zoomControl);
        this.map.controls.add(geoControl);

        geoControl.events.add('click', async () => {
          try {
            const res = await ymaps.geolocation.get({ provider: 'auto', mapStateAutoApply: false });
            const coords = res.geoObjects.position;
            this.map.setCenter(coords, 14, { duration: 500 });

            const placemark = new ymaps.Placemark(coords, {}, {
              iconLayout: 'default#image',
              iconImageHref: 'assets/icons/user-location.png',
              iconImageSize: [40, 40],
              iconImageOffset: [-20, -20]
            });
            this.clearMap();
            this.geoObjects.add(placemark);
          } catch (err) {
            console.warn('Geolocation error:', err);
          }
        });
        this.loadData();
      });
    }, 200);
  }

  clearMap() {
    if (this.geoObjects) {
      this.geoObjects.removeAll();
    }
  }

  private escapeHtml(s: string | undefined | null): string {
    if (s == null || s === '') return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Marshrut: joriy joydan nuqtaga (Yandex: rtext = ~lat,lon). */
  private yandexRouteUrl(latitude: number, longitude: number): string {
    return `https://yandex.uz/maps/?rtext=~${latitude},${longitude}`;
  }

  private balloonHtml(item: {
    name?: string;
    orientation?: string;
    latitude: number;
    longitude: number;
  }): string {
    const routeUrl = this.yandexRouteUrl(item.latitude, item.longitude);
    const btnStyle =
      'display:inline-block;margin-top:10px;padding:8px 14px;background:#00a38d;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px;';
    return (
      `<strong>${this.escapeHtml(item.name)}</strong><br>${this.escapeHtml(item.orientation)} +
  <br><a href="${routeUrl}" target="_blank" rel="noopener noreferrer" style="${btnStyle}">${this.escapeHtml(this.translateService.instant('new.get_directions'))}</a>`);
  }

  loadData() {
    this.isLoading.set(true);
    this.settings
      .getMapsFilter({keyword: this.search.value, paging: {size: 600, page:0}})
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((result: any) => {

        const data = result?.content ?? [];
         this.loactionList.set(data);
        const branches = data.filter((item) => item?.entityType === 'BRANCH');
        const atms = data.filter((item) => item?.entityType === 'ATM');

        this.banchList.set(branches);
        this.atmList.set(atms);

        if (this.activeTabIndex() === 1) {
          this.drawBranches();
        } else {
          this.drawAtms();
        }
        this.isLoading.set(false);
      });
  }

  drawAtms(): void {
    this.drawMarkers(this.atmList());
  }

  drawBranches(): void {
    this.drawMarkers(this.banchList());
  }

  private drawMarkers(items: any[], selectedId?: string): void {
    if (!this.map || !this.geoObjects) return;
    this.clearMap();

    const activeId = selectedId ?? this.activeLocation();
    let selectedPlacemark: any = null;
    let selectedCoords: [number, number] | null = null;

    items.forEach((item: any) => {
      const isSelected =
        !!activeId && String(item.id) === String(activeId);
      const placemark = new ymaps.Placemark(
        [item.latitude, item.longitude],
        {
          balloonContent: this.balloonHtml(item),
          hintContent: item.name,
        },
        {
          iconLayout: 'default#image',
          iconImageHref: isSelected
            ? 'assets/icons/tag.png'
            : 'assets/icons/tag-1.png',
          iconImageSize: isSelected ? [48, 68] : [48, 48],
          iconImageOffset: [-18, -36],
        },
      );
      this.geoObjects.add(placemark);

      if (isSelected) {
        selectedPlacemark = placemark;
        selectedCoords = [item.latitude, item.longitude];
      }
    });

    if (selectedCoords) {
      this.centerMapOnCoords(selectedCoords, selectedPlacemark);
    }
  }

  private centerMapOnTashkent(): void {
    if (!this.map) return;

    this.map.setCenter(TASHKENT_CENTER, DEFAULT_MAP_ZOOM, {
      duration: 300,
      checkZoomRange: true,
    });
  }

  private centerMapOnCoords(
    coords: [number, number],
    placemark?: any,
  ): void {
    if (!this.map) return;

    const centerAction = this.map.setCenter(coords, DEFAULT_MAP_ZOOM, {
      duration: 300,
      checkZoomRange: true,
    });

    const openBalloon = () => placemark?.balloon?.open();

    if (centerAction?.then) {
      centerAction.then(openBalloon);
    } else {
      openBalloon();
    }
  }

  changeTab(id: number) {
    if (!id) return;

    this.activeTabIndex.set(id);
    this.activeLocation.set('');

    if (id === 1) {
      this.drawBranches();
    } else {
      this.drawAtms();
    }

    this.centerMapOnTashkent();
  }

  goSettings(): void {
    this.router.navigate(['settings/bank-info']);
  }
   getBranchSchedule(branch: {
    openedAt: string;
    closedAt: string;
    closedDays: string[];
  }): string {
    const daysRu = [
      'пн',
      'вт',
      'ср',
      'чт',
      'пт',
      'сб',
      'вс'
    ];

    const dayMap: Record<string, number> = {
      MONDAY: 0,
      TUESDAY: 1,
      WEDNESDAY: 2,
      THURSDAY: 3,
      FRIDAY: 4,
      SATURDAY: 5,
      SUNDAY: 6
    };
 try {


    const closedIndexes = branch.closedDays.map(day => dayMap[day]);

    const openIndexes = daysRu
      .map((_, i) => i)
      .filter(i => !closedIndexes.includes(i));

    const openRange = `${daysRu[openIndexes[0]]}–${daysRu[openIndexes[openIndexes.length - 1]]}`;

    const closedRange =
      closedIndexes.length > 0
        ? `${daysRu[closedIndexes[0]]}–${daysRu[closedIndexes[closedIndexes.length - 1]]}`
        : '';

    const openTime = branch.openedAt.slice(0, 5);
    const closeTime = branch.closedAt.slice(0, 5);

    let result = `${openRange}: ${openTime}–${closeTime}`;
    if (closedRange) {
      result += `; ${closedRange}: выходной`;
    }

    return result;
 } catch (e) {
   return ""
 }
  }
  selectLoaction(item: {
    id?: string | number;
    latitude: number;
    longitude: number;
  }): void {
    if (item.id == null) return;
    this.activeLocation.set(String(item.id));

    const list =
      this.activeTabIndex() === 1 ? this.banchList() : this.atmList();
    this.drawMarkers(list, String(item.id));
  }
}
