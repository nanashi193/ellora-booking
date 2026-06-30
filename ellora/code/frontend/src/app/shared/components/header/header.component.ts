import { Component, ElementRef, HostBinding, HostListener, inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class Header implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  private lastScrollTop = 0;
  private scrollThreshold = 10;

  isAuthChecking = true;
  isLoggedIn = false;
  userName = '';
  userInitial = '';
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  showComingSoon = false;
  private comingSoonTimer: ReturnType<typeof setTimeout> | undefined;

  @HostBinding('class.header-hidden')
  isHidden = false;

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.isAuthChecking = false;
      return;
    }
    await this.checkAuthState();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll <= 80) {
      this.isHidden = false;
      this.lastScrollTop = currentScroll;
      return;
    }

    if (Math.abs(currentScroll - this.lastScrollTop) <= this.scrollThreshold) {
      return;
    }

    if (currentScroll > this.lastScrollTop) {
      this.isHidden = true;
    } else {
      this.isHidden = false;
    }

    this.lastScrollTop = currentScroll;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen && !this.isMobileMenuOpen) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
      this.isMobileMenuOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateTo(route: string): void {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.router.navigateByUrl(route);
  }

  showComingSoonToast(): void {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this.showComingSoon = true;
    clearTimeout(this.comingSoonTimer);
    this.comingSoonTimer = setTimeout(() => {
      this.showComingSoon = false;
    }, 2000);
  }

  async logout(): Promise<void> {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    await this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.userInitial = '';
    await this.router.navigateByUrl('/login');
  }

  private async checkAuthState(): Promise<void> {
    try {
      this.isLoggedIn = await this.authService.isAuthenticated();
      if (this.isLoggedIn) {
        try {
          const profile = await this.authService.getUserProfile();
          this.userName = profile.name || profile.email;
          this.userInitial = this.userName.charAt(0).toUpperCase();
        } catch {
          this.userName = 'User';
          this.userInitial = 'U';
        }
      }
    } finally {
      this.isAuthChecking = false;
      this.cdr.detectChanges();
    }
  }
}
