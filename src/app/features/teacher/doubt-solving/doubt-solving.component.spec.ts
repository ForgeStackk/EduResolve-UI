import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoubtSolvingComponent } from '../../../doubt-solving.component';

describe('DoubtSolvingComponent', () => {
  let component: DoubtSolvingComponent;
  let fixture: ComponentFixture<DoubtSolvingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubtSolvingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DoubtSolvingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});