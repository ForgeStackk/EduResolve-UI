import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { QuizRunnerComponent } from './quiz-runner.component';

describe('QuizRunnerComponent', () => {
  let component: QuizRunnerComponent;
  let fixture: ComponentFixture<QuizRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizRunnerComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
