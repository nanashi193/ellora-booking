import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../shared/components/header/header.component';
import { Footer } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayout implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private footerResizeObserver?: ResizeObserver;

  footerRevealHeight = signal(360);

  @ViewChild('footerRevealLayer')
  private footerRevealLayer?: ElementRef<HTMLElement>;

  get isHomePage(): boolean {
    return this.router.url.split('?')[0].split('#')[0] === '/';
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.footerRevealLayer?.nativeElement) {
      return;
    }

    const footerElement = this.footerRevealLayer.nativeElement;
    const updateFooterHeight = () => {
      this.footerRevealHeight.set(Math.ceil(footerElement.getBoundingClientRect().height));
    };

    updateFooterHeight();
    this.footerResizeObserver = new ResizeObserver(updateFooterHeight);
    this.footerResizeObserver.observe(footerElement);
  }

  ngOnDestroy(): void {
    this.footerResizeObserver?.disconnect();
  }
}
