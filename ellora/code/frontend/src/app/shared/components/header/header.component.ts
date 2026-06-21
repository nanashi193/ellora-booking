import { Component, HostBinding, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from '../button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, Button],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class Header {
  private lastScrollTop = 0;
  private scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

  @HostBinding('class.header-hidden')
  isHidden = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Don't hide at the very top of the page
    if (currentScroll <= 80) {
      this.isHidden = false;
      this.lastScrollTop = currentScroll;
      return;
    }

    // Check if we scrolled enough to trigger a change
    if (Math.abs(currentScroll - this.lastScrollTop) <= this.scrollThreshold) {
      return;
    }

    if (currentScroll > this.lastScrollTop) {
      // Scrolling down
      this.isHidden = true;
    } else {
      // Scrolling up
      this.isHidden = false;
    }
    
    this.lastScrollTop = currentScroll;
  }
}
