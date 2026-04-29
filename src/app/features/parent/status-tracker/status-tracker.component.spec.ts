import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusTrackerComponent, type RequestStatus } from './status-tracker.component';

describe('StatusTrackerComponent', () => {
  let component: StatusTrackerComponent;
  let fixture: ComponentFixture<StatusTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTrackerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusTrackerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display three status steps', () => {
    expect(component.steps.length).toBe(3);
    expect(component.steps).toEqual(['Pending', 'In-Review', 'Resolved']);
  });

  it('should apply correct class for pending status', () => {
    fixture.componentRef.setInput('status', 'Pending');
    fixture.detectChanges();

    const stepClass = component.getStepClass('Pending');
    expect(stepClass).toContain('bg-brand-orange');
  });

  it('should apply completed class for earlier steps when on in-review', () => {
    fixture.componentRef.setInput('status', 'In-Review');
    fixture.detectChanges();

    const pendingClass = component.getStepClass('Pending');
    expect(pendingClass).toContain('bg-green-500');
  });

  it('should apply incomplete class for later steps', () => {
    fixture.componentRef.setInput('status', 'Pending');
    fixture.detectChanges();

    const resolvedClass = component.getStepClass('Resolved');
    expect(resolvedClass).toContain('bg-gray-200');
  });

  it('should update line color based on step completion', () => {
    fixture.componentRef.setInput('status', 'In-Review');
    fixture.detectChanges();

    const pendingLineClass = component.getLineClass('Pending');
    expect(pendingLineClass).toContain('bg-green-500');

    const inReviewLineClass = component.getLineClass('In-Review');
    expect(inReviewLineClass).toContain('bg-gray-200');
  });

  it('should update text color based on step completion', () => {
    fixture.componentRef.setInput('status', 'In-Review');
    fixture.detectChanges();

    const pendingTextClass = component.getTextClass('Pending');
    expect(pendingTextClass).toContain('text-brand-black');

    const resolvedTextClass = component.getTextClass('Resolved');
    expect(resolvedTextClass).toContain('text-gray-400');
  });

  it('should handle all status values correctly', () => {
    const statuses: RequestStatus[] = ['Pending', 'In-Review', 'Resolved'];

    statuses.forEach(status => {
      fixture.componentRef.setInput('status', status);
      fixture.detectChanges();
      expect(component.status()).toBe(status);
    });
  });
});
