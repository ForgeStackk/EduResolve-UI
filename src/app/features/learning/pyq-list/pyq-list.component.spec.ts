import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PyqListComponent } from './pyq-list.component';

describe('PyqListComponent', () => {
  let component: PyqListComponent;
  let fixture: ComponentFixture<PyqListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PyqListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PyqListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
