import { environment } from 'src/environments/development';

const REMOTE_ENTRY_PATTERN = /remoteEntry/i;
const APP_CHUNK_PATTERN = /(?:main|polyfills|chunk)[^/]*\.(?:js|mjs)$/i;

function normalizeBaseUrl(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

function resolveBaseUrlFromScripts(document: Document): string | null {
  const scripts = [...document.querySelectorAll('script[src]')]
    .map((script) => script.getAttribute('src') ?? '')
    .filter(Boolean)
    .reverse();

  for (const src of scripts) {
    if (!REMOTE_ENTRY_PATTERN.test(src) && !APP_CHUNK_PATTERN.test(src)) {
      continue;
    }

    try {
      return normalizeBaseUrl(new URL('.', new URL(src, document.baseURI)).href);
    } catch {
      continue;
    }
  }

  return null;
}

/** Базовый URL статики remote: prod — из env, dev — из remoteEntry/main.js, иначе base href. */
export function resolveAssetsBaseUrl(document: Document): string {
  if (environment.assetsBaseUrl) {
    return normalizeBaseUrl(environment.assetsBaseUrl);
  }

  const fromScript = resolveBaseUrlFromScripts(document);

  if (fromScript) {
    return fromScript;
  }

  const baseHref = document.querySelector('base')?.getAttribute('href');

  if (baseHref) {
    return normalizeBaseUrl(new URL(baseHref, document.baseURI).href);
  }

  return '';
}

export function resolveAssetUrl(document: Document, assetPath: string): string {
  const base = resolveAssetsBaseUrl(document);
  const normalizedPath = assetPath.replace(/^\//, '');

  return base ? `${base}${normalizedPath}` : normalizedPath;
}
