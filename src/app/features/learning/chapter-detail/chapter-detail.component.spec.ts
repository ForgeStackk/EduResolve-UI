import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ChapterDetailComponent } from './chapter-detail.component';

describe('ChapterDetailComponent', () => {
  let component: ChapterDetailComponent;
  let fixture: ComponentFixture<ChapterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ChapterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
