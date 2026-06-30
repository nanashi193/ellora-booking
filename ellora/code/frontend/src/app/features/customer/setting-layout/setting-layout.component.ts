import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-setting-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './setting-layout.component.html'
})
export class SettingLayoutComponent {
  constructor(public router: Router) {}
}
