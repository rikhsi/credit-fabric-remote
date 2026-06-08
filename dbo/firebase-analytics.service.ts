import { Injectable } from '@angular/core';
import {environment} from "./src/environments/environment";
import { app } from './firebase-setup';
import {Analytics, setUserId, setUserProperties, logEvent} from "@angular/fire/analytics";
import {getUserId} from "./src/app/core/utils";


export interface UserProperties {
  user_id?: string | null;
  business_id?: string | null;
  role?: string | null;
  auth_flow_id?: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class FirebaseAnalyticsService {
  private analytics: Analytics | null = null;

  private async init() {
    if (
      !this.analytics &&
      typeof window !== 'undefined' && app
    ) {
      try {
        const { getAnalytics } = await import('@angular/fire/analytics');
        this.analytics = getAnalytics(app);
        // console.log('ANALYTICS', this.analytics)
      } catch (e) {
        console.warn('Firebase Analytics init failed:', e);
      }
    }
  }

 private getDefaultParams(): Record<string, any> {
    return {
      platform: 'web',
      env: environment.production ? 'prod' : 'dev',
      app_version: environment.appVersion ?? '1.0.0',
      build_number: environment.buildNumber ?? '1',
      network_type: navigator.onLine ? 'online' : 'offline',
      device_type: 'web',
      user_hash_id: getUserId()
    };
  }


async setUserProperties(props: UserProperties): Promise<void> {
  await this.init();
  if (!this.analytics) return;
  // user_id ni alohida handle qilamiz
  if ('user_id' in props) {
    setUserId(this.analytics, props.user_id ?? null);
  }

  const { user_id, ...customProps } = props;

  const filteredProps = Object.fromEntries(
    Object.entries(customProps).filter(
      ([, v]) => v !== undefined && v !== '' && v !== 'null' && v !== 'undefined' && v !== 'NaN'
    )
  ) as Record<string, string | null>;

  if (Object.keys(filteredProps).length > 0) {
    setUserProperties(this.analytics, filteredProps);
  }
}

  async clearUserProperties(): Promise<void> {
    await this.init();
    if (!this.analytics) return;

    setUserId(this.analytics, null);
    setUserProperties(this.analytics, {
      business_id:  null,
      role:         null,
      auth_flow_id: null,
    });


  }


  // async setUserFirebaseCustomEvent(hashedBusinessId: string | null) {
  //   await this.init();
  //   if (!this.analytics) return;
  //   if (hashedBusinessId !== null) {
  //     setUserId(this.analytics, hashedBusinessId);
  //     console.log('setUserFirebaseCustomEvent', this.analytics)
  //   }
  // }
  // async deleteUserFirebaseCustomEvent() {
  //     await this.init();
  //     if (!this.analytics) return;
  //     setUserId(this.analytics, null);
  //     console.log('deleteUserFirebaseCustomEvent', this.analytics)
  // }
  // async setUserPropertiesFirebaseCustomEvent(hashedBusinessId: string | null) {
  //   await this.init();
  //   if (!this.analytics) return;
  //   if (hashedBusinessId !== null) {
  //     setUserProperties(this.analytics, { business_id: hashedBusinessId});
  //     console.log('setUserPropertiesFirebaseCustomEvent', this.analytics)
  //   }
  // }

  // async deleteUserPropertiesFirebaseCustomEvent() {
  //   await this.init();
  //   if (!this.analytics) return;
  //   setUserProperties(this.analytics, { business_id: null});
  //   this.clearUserProperties()
  //    console.log('deleteUserPropertiesFirebaseCustomEvent', this.analytics)
  // }


  async logFirebaseCustomEvent(eventName: string,data: Record<string, any> | null,screenName?: string) {
    await this.init();
  if (!this.analytics) {
    console.log('ANALYTICS NULL - qaytib ketdi!');
    return;
  }

    if (!this.analytics) return;
      const params = {
      ...this.getDefaultParams(),
      ...(screenName ? { screen_name: screenName } : {}),
      ...(data ?? {}),
    };
    logEvent(this.analytics, eventName, params);
      // logEvent(analytics, eventName, {...data});
      // if (data && Object.keys(data)?.length > 0) {
      //   logEvent(this.analytics, eventName, params);
      //    console.log('logFirebaseCustomEvent 22222 EVENT_NAME', eventName)
      //    console.log('logFirebaseCustomEvent 22222 DATA', params)

      // } else {
      //   logEvent(this.analytics, eventName);
      //    console.log('logFirebaseCustomEvent 333333 EVENT_NAME', eventName)
      //    console.log('logFirebaseCustomEvent 333333 DATA', data)
      // }

    }
}



