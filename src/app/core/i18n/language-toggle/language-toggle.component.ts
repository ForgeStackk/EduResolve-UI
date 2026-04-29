import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../language.service';

/**
 * Two-button language toggle. Drop into any header / shell.
 *
 *   <app-language-toggle></app-language-toggle>
 */
@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.css'
})
export class LanguageToggleComponent {
  protected lang = inject(LanguageService);
}
