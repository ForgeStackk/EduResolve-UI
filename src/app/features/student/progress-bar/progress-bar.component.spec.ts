import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label correctly', () => {
    fixture.componentRef.setInput('label', 'Mathematics');
    fixture.componentRef.setInput('progress', 85);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('span.text-sm');
    expect(labels[0].textContent).toContain('Mathematics');
  });

  it('should display progress percentage correctly', () => {
    fixture.componentRef.setInput('label', 'Science');
    fixture.componentRef.setInput('progress', 92);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('span.text-sm');
    expect(labels[1].textContent).toContain('92%');
  });

  it('should apply default color class when not provided', () => {
    fixture.componentRef.setInput('label', 'English');
    fixture.componentRef.setInput('progress', 78);
    fixture.detectChanges();

    expect(component.colorClass()).toBe('bg-brand-orange');
  });

  it('should apply custom color class when provided', () => {
    fixture.componentRef.setInput('label', 'History');
    fixture.componentRef.setInput('progress', 85);
    fixture.componentRef.setInput('colorClass', 'bg-purple-500');
    fixture.detectChanges();

    expect(component.colorClass()).toBe('bg-purple-500');
  });

  it('should set progress bar width based on progress input', () => {
    fixture.componentRef.setInput('label', 'Math');
    fixture.componentRef.setInput('progress', 75);
    fixture.detectChanges();

    const progressDiv = fixture.nativeElement.querySelector('div[class*="rounded-full"]:not(.bg-gray-200)');
    expect(progressDiv.style.width).toBe('75%');
  });

  it('should handle 0% progress', () => {
    fixture.componentRef.setInput('label', 'Subject');
    fixture.componentRef.setInput('progress', 0);
    fixture.detectChanges();

    const progressDiv = fixture.nativeElement.querySelector('div[class*="rounded-full"]:not(.bg-gray-200)');
    expect(progressDiv.style.width).toBe('0%');
  });

  it('should handle 100% progress', () => {
    fixture.componentRef.setInput('label', 'Subject');
    fixture.componentRef.setInput('progress', 100);
    fixture.detectChanges();

    const progressDiv = fixture.nativeElement.querySelector('div[class*="rounded-full"]:not(.bg-gray-200)');
    expect(progressDiv.style.width).toBe('100%');
  });
});
