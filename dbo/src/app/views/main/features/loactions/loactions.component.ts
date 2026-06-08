import {ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject} from '@angular/core';
import {SettingsService} from "../settings/services/settings.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

declare const ymaps: any;

@Component({
  selector: 'app-loactions',
  standalone: true,
  template: `
    <div id="yandex-map" style="width: 100%; height: 500px;"></div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoactionsComponent implements OnInit {
  private readonly settings = inject(SettingsService);
  readonly destroy = inject(DestroyRef);

  ngOnInit() {
    this.settings.getMaps()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((result: any) => {
        const data = result ?? [];

        ymaps.ready(() => {
          const map = new ymaps.Map("yandex-map", {
            center: [41.2995, 69.2401],
            zoom: 12,
          });
          data.forEach((item: any) => {
            const placemark = new ymaps.Placemark(
              [item.latitude, item.longitude],
              {
                balloonContent: `<strong>${item.name}</strong><br>${item.orientation}`,
                hintContent: item.name,
              },
              {
                preset: 'islands#redIcon'
              }
            );
            map.geoObjects.add(placemark);
          });
        });
      });
  }
}
