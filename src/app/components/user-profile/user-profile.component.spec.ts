import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from '../../user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.componentRef.setInput('role', 'student');
    fixture.componentRef.setInput('initials', 'JD');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});