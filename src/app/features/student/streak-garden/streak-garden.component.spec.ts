import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreakGardenComponent } from './streak-garden.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('StreakGardenComponent', () => {
  let component: StreakGardenComponent;
  let fixture: ComponentFixture<StreakGardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreakGardenComponent, HttpClientTestingModule],
      providers: [
        // Mock any services if needed
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StreakGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});