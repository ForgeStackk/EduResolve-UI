import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notes-coming-soon',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notes-coming-soon.component.html',
  styleUrl: './notes-coming-soon.component.css'
})
export class NotesComingSoonComponent {
  constructor(private location: Location) {}
  back(): void { this.location.back(); }
}
