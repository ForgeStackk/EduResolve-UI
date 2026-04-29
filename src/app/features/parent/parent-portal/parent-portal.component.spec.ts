import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentPortalComponent } from './parent-portal.component';
import { ComplaintFormComponent } from '../complaint-form/complaint-form.component';
import { StatusTrackerComponent } from '../status-tracker/status-tracker.component';
import { ProgressBarComponent } from '../../progress-bar/progress-bar.component';

describe('ParentPortalComponent', () => {
  let component: ParentPortalComponent;
  let fixture: ComponentFixture<ParentPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ParentPortalComponent,
        ComplaintFormComponent,
        StatusTrackerComponent,
        ProgressBarComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ParentPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display parent portal title', () => {
    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toContain('Parent Portal');
  });

  it('should initialize with notices', () => {
    expect(component.notices.length).toBe(3);
  });

  it('should initialize with requests', () => {
    expect(component.requests().length).toBe(2);
  });

  it('should add new request to requests signal', () => {
    const newRequest = {
      id: 'test-req',
      category: 'Fee',
      subject: 'Test Subject',
      description: 'Test Description',
      status: 'Pending' as const,
      date: new Date()
    };

    component.handleNewRequest(newRequest);
    expect(component.requests().length).toBe(3);
    expect(component.requests()[0]).toEqual(newRequest);
  });

  it('should display progress bars for academics', () => {
    const progressBars = fixture.nativeElement.querySelectorAll('app-progress-bar');
    expect(progressBars.length).toBe(4); // Math, Science, English, History
  });
});
