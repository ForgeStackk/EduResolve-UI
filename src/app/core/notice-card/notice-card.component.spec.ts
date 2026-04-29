import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticeCardComponent } from './notice-card.component';

describe('NoticeCardComponent', () => {
  let component: NoticeCardComponent;
  let fixture: ComponentFixture<NoticeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoticeCardComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('title', 'Meeting Update');
    fixture.componentRef.setInput('date', 'Oct 24, 2026');
    fixture.componentRef.setInput('content', 'Parent-Teacher conference scheduled.');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});