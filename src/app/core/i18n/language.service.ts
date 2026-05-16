import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'hi';

const STORAGE_KEY = 'eduresolve.lang';
const DEFAULT_LANGUAGE: AppLanguage = 'en';

/**
 * Centralised language switcher. Persists the chosen language to
 * `localStorage` (browser only) and keeps `TranslateService` in sync.
 *
 * Other parts of the app should:
 *   - read `current()` to get the active language signal
 *   - call `set(lang)` to switch
 *   - subscribe to `changes` for side-effects (e.g. re-fetching content
 *     in the new language).
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  /** Active language as a signal so templates can react. */
  readonly current = signal<AppLanguage>(DEFAULT_LANGUAGE);

  constructor() {
    this.translate.addLangs(['en', 'hi']);
    // setFallbackLang returns a cold Observable - subscribe so the fallback
    // bundle is actually fetched.
    this.translate.setFallbackLang('en').subscribe();

    const initial = this.readStored() ?? DEFAULT_LANGUAGE;
    this.set(initial);
  }

  /** Wait for initial language to be loaded (for app initializer) */
  async initialize(): Promise<void> {
    const lang = this.current();
    await this.translate.use(lang).toPromise();
  }

  set(lang: AppLanguage): void {
    this.current.set(lang);
    // `use(lang)` is also a cold Observable in ngx-translate v17 - the JSON
    // is only fetched when something subscribes.
    this.translate.use(lang).subscribe();
    if (isPlatformBrowser(this.platformId)) {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
      document.documentElement.setAttribute('lang', lang);
    }
  }

  toggle(): void {
    this.set(this.current() === 'en' ? 'hi' : 'en');
  }

  private readStored(): AppLanguage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'en' || v === 'hi' ? v : null;
    } catch { return null; }
  }
}
