import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminCommunicationHubComponent } from './admin-communication-hub.component';

describe('AdminCommunicationHubComponent', () => {
  let component: AdminCommunicationHubComponent;
  let fixture: ComponentFixture<AdminCommunicationHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCommunicationHubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminCommunicationHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});