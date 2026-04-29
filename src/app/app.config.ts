import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';
import { LanguageService } from './core/i18n/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    // ngx-translate v17 - loads /i18n/{lang}.json from `public/i18n`
    provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en'
    }),
    // Construct LanguageService eagerly so translations are fetched before the
    // first component renders. Without this, the first paint shows raw keys
    // until something (e.g. TopNav -> LanguageToggle) injects the service.
    provideAppInitializer(() => { inject(LanguageService); })
  ]
};