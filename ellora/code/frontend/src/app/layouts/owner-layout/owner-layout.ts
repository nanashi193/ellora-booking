import { Component, ElementRef, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './owner-layout.html',
  styleUrl: './owner-layout.css',
})
export class OwnerLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  userName = '';
  userInitial = '';
  isDropdownOpen = false;

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.authService.getUserProfile();
      this.userName = profile.name || profile.email;
      this.userInitial = this.userName.charAt(0).toUpperCase();
    } catch {
      this.userName = 'Owner';
      this.userInitial = 'O';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('.user-dropdown-container')?.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  async logout(): Promise<void> {
    this.isDropdownOpen = false;
    await this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
