import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeManagementComponent } from './fee-management.component';

describe('FeeManagementComponent', () => {
  let component: FeeManagementComponent;
  let fixture: ComponentFixture<FeeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});