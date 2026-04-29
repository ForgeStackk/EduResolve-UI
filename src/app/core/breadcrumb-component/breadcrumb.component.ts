import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  breadcrumbs: { label: string, path: string }[] = [];
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(() => this.buildBreadcrumbs(this.router.url));
    this.buildBreadcrumbs(this.router.url);
  }

  private buildBreadcrumbs(url: string) {
    let currentPath = '';
    this.breadcrumbs = url.split('?')[0].split('/').filter(Boolean).map(segment => {
      currentPath += `/${segment}`;
      return { label: segment.replace(/-/g, ' '), path: currentPath };
    });
  }
}