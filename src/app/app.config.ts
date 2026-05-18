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
    // Order matters: provideTranslateService registers TranslateNoOpLoader first;
    // provideTranslateHttpLoader then overrides it (Angular's last-provider-wins rule).
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en'
    }),
    provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
    // Construct LanguageService eagerly so translations are fetched before the
    // first component renders. Without this, the first paint shows raw keys
    // until something (e.g. TopNav -> LanguageToggle) injects the service.
    provideAppInitializer(() => {
      const langService = inject(LanguageService);
      return langService.initialize();
    })
  ]
};