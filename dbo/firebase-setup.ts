import { initializeApp } from "@angular/fire/app";
import { environment } from "./src/environments/environment";

const firebaseConfig = environment.production ? environment.firebaseConfigProd :  environment.firebaseConfigDev;

// Firebase app - faqat brauzer muhitida initialize qilamiz (production build xatolarini oldini olish)
export const app =
  typeof window !== 'undefined'
    ? initializeApp(firebaseConfig)
    : (null as any);
