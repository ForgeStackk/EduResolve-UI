import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeworkManagementComponent } from './homework-management.component';

describe('HomeworkManagementComponent', () => {
  let component: HomeworkManagementComponent;
  let fixture: ComponentFixture<HomeworkManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeworkManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeworkManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});