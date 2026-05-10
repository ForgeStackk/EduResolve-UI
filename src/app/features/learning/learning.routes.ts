import { Routes } from '@angular/router';

export const LEARNING_ROUTES: Routes = [
  {
    path: 'subjects',
    loadComponent: () => import('./subjects-list/subjects-list.component').then(m => m.SubjectsListComponent)
  },
  {
    path: 'ncert',
    loadComponent: () => import('./ncert-browser/ncert-browser.component').then(m => m.NcertBrowserComponent)
  },
  {
    path: 'pdf-viewer',
    loadComponent: () => import('./pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent)
  },
  {
    path: 'subjects/:subjectId',
    loadComponent: () => import('./chapters-list/chapters-list.component').then(m => m.ChaptersListComponent)
  },
  {
    path: 'chapters/:id',
    loadComponent: () => import('./chapter-detail/chapter-detail.component').then(m => m.ChapterDetailComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./quiz-runner/quiz-runner.component').then(m => m.QuizRunnerComponent)
  },
  {
    path: 'pyqs',
    loadComponent: () => import('./pyq-list/pyq-list.component').then(m => m.PyqListComponent)
  },
  {
    path: 'doubt',
    loadComponent: () => import('./doubt-solver/doubt-solver.component').then(m => m.DoubtSolverComponent)
  },
  {
    path: 'bookmarks',
    loadComponent: () => import('./bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
  },
  { path: '', redirectTo: 'subjects', pathMatch: 'full' }
];
