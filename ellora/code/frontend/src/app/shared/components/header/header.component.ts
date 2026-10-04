import { Component, ElementRef, HostBinding, HostListener, inject, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
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
export class Header implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  private readonly handleScroll = () => {
    const atTop = window.scrollY <= 20;
    if (this.isAtTop !== atTop) this.zone.run(() => { this.isAtTop = atTop; });
  };
  isAtTop = true;

  isAuthChecking = true;
  isLoggedIn = false;
  userName = '';
  userInitial = '';
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isSearchActive = false;
  activeSearchSection: 'service' | 'location' | 'time' | null = null;

  @ViewChild('serviceInput') serviceInput?: ElementRef<HTMLInputElement>;
  @ViewChild('locationInput') locationInput?: ElementRef<HTMLInputElement>;

  showComingSoon = false;
  private comingSoonTimer: ReturnType<typeof setTimeout> | undefined;

  @HostBinding('class.header-hidden')
  isHidden = false;

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.isAuthChecking = false;
      return;
    }
    this.zone.runOutsideAngular(() => window.addEventListener('scroll', this.handleScroll, { passive: true }));
    await this.checkAuthState();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) window.removeEventListener('scroll', this.handleScroll);
    clearTimeout(this.comingSoonTimer);
  }

  get isHomePage(): boolean {
    return this.router.url === '/';
  }

  get isBookingPage(): boolean {
    return this.router.url.startsWith('/booking');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen && !this.isMobileMenuOpen && !this.isSearchActive) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
      this.isMobileMenuOpen = false;
      this.isSearchActive = false;
      this.activeSearchSection = null;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleSearch(active?: boolean, section?: 'service' | 'location' | 'time' | null): void {
    if (active !== undefined) {
      this.isSearchActive = active;
    } else {
      this.isSearchActive = !this.isSearchActive;
    }

    this.activeSearchSection = section || null;

    if (this.isSearchActive && this.activeSearchSection) {
      setTimeout(() => {
        if (this.activeSearchSection === 'service') {
          this.serviceInput?.nativeElement.focus();
        } else if (this.activeSearchSection === 'location') {
          this.locationInput?.nativeElement.focus();
        }
      }, 50);
    }

    this.cdr.detectChanges();
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
