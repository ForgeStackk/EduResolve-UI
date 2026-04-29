import { ComponentFixture, TestBed } from '@angular/core/testing';
import { McqQuizComponent } from './mcq-quiz.component';

describe('McqQuizComponent', () => {
  let component: McqQuizComponent;
  let fixture: ComponentFixture<McqQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McqQuizComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(McqQuizComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('questions', [
      {
        id: 'q1',
        text: 'What is the speed of light?',
        options: [{ id: 'o1', text: '3 × 10^8 m/s' }],
        correctOptionId: 'o1',
        explanation: 'Constant speed.'
      }
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
