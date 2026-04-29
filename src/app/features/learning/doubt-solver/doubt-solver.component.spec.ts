import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DoubtSolverComponent } from './doubt-solver.component';

describe('DoubtSolverComponent', () => {
  let component: DoubtSolverComponent;
  let fixture: ComponentFixture<DoubtSolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubtSolverComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(DoubtSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
