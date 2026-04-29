import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComplaintFormComponent, type ComplaintRequest } from './complaint-form.component';

describe('ComplaintFormComponent', () => {
  let component: ComplaintFormComponent;
  let fixture: ComponentFixture<ComplaintFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.get('category')?.value).toBe('');
    expect(component.form.get('subject')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBeTruthy();
  });

  it('should have valid form when all fields are filled', () => {
    component.form.patchValue({
      category: 'Fee',
      subject: 'Test Subject',
      description: 'Test Description'
    });
    expect(component.form.valid).toBeTruthy();
  });

  it('should emit onSubmitRequest when form is submitted with valid data', (done) => {
    component.onSubmitRequest.subscribe((request: ComplaintRequest) => {
      expect(request.category).toBe('Fee');
      expect(request.subject).toBe('Test Subject');
      expect(request.description).toBe('Test Description');
      expect(request.status).toBe('Pending');
      done();
    });

    component.form.patchValue({
      category: 'Fee',
      subject: 'Test Subject',
      description: 'Test Description'
    });

    component.onSubmit();
  });

  it('should reset form after successful submission', () => {
    component.form.patchValue({
      category: 'Fee',
      subject: 'Test Subject',
      description: 'Test Description'
    });

    component.onSubmit();

    expect(component.form.get('category')?.value).toBe('');
    expect(component.form.get('subject')?.value).toBe('');
    expect(component.form.get('description')?.value).toBe('');
  });

  it('should not emit when form is invalid', (done) => {
    let emitCount = 0;
    component.onSubmitRequest.subscribe(() => {
      emitCount++;
    });

    component.onSubmit();
    setTimeout(() => {
      expect(emitCount).toBe(0);
      done();
    }, 100);
  });
});
