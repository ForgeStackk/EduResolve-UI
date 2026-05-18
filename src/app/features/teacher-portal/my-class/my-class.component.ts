import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-my-class',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './my-class.component.html'
})
export class MyClassComponent {
  readonly tabs = [
    { label: 'Attendance',  path: 'attendance' },
    { label: 'Messages',    path: 'messages' },
    { label: 'Reports',     path: 'reports' },
  ];
}
