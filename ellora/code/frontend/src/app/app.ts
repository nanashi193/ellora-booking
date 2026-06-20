import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.setAuthTransition(event.url);
          return;
        }

        const supportsViewTransition =
          typeof (this.document as Document & { startViewTransition?: unknown }).startViewTransition === 'function';

        if (!supportsViewTransition) {
          this.document.documentElement.removeAttribute('data-route-transition');
        }
      });
  }

  private setAuthTransition(nextUrl: string): void {
    const currentRoute = this.getAuthRoute(this.router.url);
    const nextRoute = this.getAuthRoute(nextUrl);

    if (currentRoute === 'login' && nextRoute === 'register') {
      this.document.documentElement.setAttribute('data-route-transition', 'auth-left');
      return;
    }

    if (currentRoute === 'register' && nextRoute === 'login') {
      this.document.documentElement.setAttribute('data-route-transition', 'auth-right');
      return;
    }

    this.document.documentElement.removeAttribute('data-route-transition');
  }

  private getAuthRoute(url: string): 'login' | 'register' | null {
    const path = url.split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0];

    if (path === 'login' || path === 'register') {
      return path;
    }

    return null;
  }
}
