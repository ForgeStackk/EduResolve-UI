import { Component } from '@angular/core';
import { LanguageToggleComponent } from '../i18n/language-toggle/language-toggle.component';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [LanguageToggleComponent],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css'
})
export class TopNavComponent {}