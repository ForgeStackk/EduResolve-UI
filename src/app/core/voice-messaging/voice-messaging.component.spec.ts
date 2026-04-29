import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoiceMessagingComponent } from './voice-messaging.component';

describe('VoiceMessagingComponent', () => {
  let component: VoiceMessagingComponent;
  let fixture: ComponentFixture<VoiceMessagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceMessagingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoiceMessagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
