// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SidebarComponent } from './sidebar.component';
// import { AuthService } from '../../core/auth/auth.service';

// describe('SidebarComponent', () => {
//   let component: SidebarComponent;
//   let fixture: ComponentFixture<SidebarComponent>;
//   let authService: jasmine.SpyObj<AuthService>;

//   beforeEach(async () => {
//     const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
//       currentUser: jasmine.createSpy('currentUser').and.returnValue(null)
//     });

//     await TestBed.configureTestingModule({
//       imports: [SidebarComponent],
//       providers: [{ provide: AuthService, useValue: authServiceSpy }]
//     }).compileComponents();

//     authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
//     fixture = TestBed.createComponent(SidebarComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should display logo with correct text', () => {
//     const logo = fixture.nativeElement.querySelector('h2');
//     expect(logo.textContent).toContain('EduResolve');
//   });

//   it('should show login prompt when user is not authenticated', () => {
//     const loginPrompt = fixture.nativeElement.querySelector('nav div.text-gray-400');
//     expect(loginPrompt?.textContent).toContain('Please log in');
//   });

//   it('should return null currentUser when not authenticated', () => {
//     expect(component.currentUser).toBeNull();
//   });
// });
