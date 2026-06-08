import { Injectable, signal, effect, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TabsStore {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<string>('');

  constructor() {
    effect(() => {
      if (this.activeTab()) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: this.activeTab() },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  init(tabs: string[]) {
    const tabFromQuery = this.route.snapshot.queryParamMap.get('tab');
    if (tabFromQuery && tabs.includes(tabFromQuery)) {
      this.activeTab.set(tabFromQuery);
    } else {
      this.activeTab.set(tabs[0]);
    }
  }

  setActive(tab: string) {
    this.activeTab.set(tab);
  }
}
