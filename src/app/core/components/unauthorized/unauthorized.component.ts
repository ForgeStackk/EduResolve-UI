import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 class="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
        <p class="text-gray-600 mb-6">You do not have permission to access this resource.</p>
        <a href="/" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
          Go Home
        </a>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {}
