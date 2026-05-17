import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LeaderboardComponent } from './leaderboard.component';
import { AuthService } from '../../../core/auth/auth.service';
import { signal } from '@angular/core';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: { currentUser: signal(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    component.classGrade = '9';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct title for index', () => {
    expect(component.getTitle(0)).toBe('Concept Master');
    expect(component.getTitle(4)).toBe('Dedicated Scholar');
    expect(component.getTitle(10)).toBe('Ninja Intraining');
  });
});
