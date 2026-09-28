import { DOCUMENT } from '@angular/common';
import { inject, provideAppInitializer } from '@angular/core';
import { resolveAssetUrl } from '@shared/utils/assets-base-url';

const SPLASH_STYLE_ID = 'cf-splash-styles';
const SPLASH_ELEMENT_ID = 'cf-splash';

const SPLASH_STYLES = `
#${SPLASH_ELEMENT_ID},
.splash {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
  z-index: 2147483647;
  background: #ffffff;
}
html.dark #${SPLASH_ELEMENT_ID},
html.dark .splash {
  background: #262626;
}
#${SPLASH_ELEMENT_ID}.none,
.splash.none {
  display: none;
}
#${SPLASH_ELEMENT_ID} .splash-image,
.splash-image {
  object-fit: contain;
}
`.trim();

export function ensureSplash(document: Document): HTMLElement {
  if (!document.getElementById(SPLASH_STYLE_ID)) {
    const style = document.createElement('style');
    style.id = SPLASH_STYLE_ID;
    style.textContent = SPLASH_STYLES;
    document.head.appendChild(style);
  }

  let splash = document.getElementById(SPLASH_ELEMENT_ID);

  if (!splash) {
    splash = document.createElement('div');
    splash.id = SPLASH_ELEMENT_ID;
    splash.className = 'splash';

    const img = document.createElement('img');
    img.className = 'splash-image';
    img.alt = 'Hamkorbank';
    img.src = resolveAssetUrl(document, 'images/logo-full.svg');

    splash.appendChild(img);
    document.body.appendChild(splash);
  }

  return splash;
}

export function removeSplash(document: Document = globalThis.document): void {
  document.getElementById(SPLASH_ELEMENT_ID)?.remove();
  document.getElementById(SPLASH_STYLE_ID)?.remove();
}

export const provideSplash = provideAppInitializer(() => {
  ensureSplash(inject(DOCUMENT));
});
