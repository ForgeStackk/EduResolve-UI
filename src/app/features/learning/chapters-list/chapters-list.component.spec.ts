import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ChaptersListComponent } from './chapters-list.component';

describe('ChaptersListComponent', () => {
  let component: ChaptersListComponent;
  let fixture: ComponentFixture<ChaptersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChaptersListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ChaptersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
