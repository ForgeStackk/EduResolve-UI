import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { LanguageToggleComponent } from './language-toggle.component';

describe('LanguageToggleComponent', () => {
  let component: LanguageToggleComponent;
  let fixture: ComponentFixture<LanguageToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageToggleComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ fallbackLang: 'en', lang: 'en' })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
