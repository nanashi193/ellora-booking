import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Điều hướng quản trị" class="mb-6 flex flex-wrap gap-2 border-b border-charcoal-800/10 pb-4">
      <a routerLink="/admin/dashboard" routerLinkActive="bg-[#8C3A5A] text-white" [routerLinkActiveOptions]="{ exact: true }" class="rounded-full border px-4 py-2 text-sm">Tổng quan</a>
      <a routerLink="/admin/users" routerLinkActive="bg-[#8C3A5A] text-white" class="rounded-full border px-4 py-2 text-sm">Người dùng</a>
      <a routerLink="/admin/approvals" routerLinkActive="bg-[#8C3A5A] text-white" class="rounded-full border px-4 py-2 text-sm">Duyệt salon</a>
      <a routerLink="/admin/content" routerLinkActive="bg-[#8C3A5A] text-white" class="rounded-full border px-4 py-2 text-sm">Nội dung</a>
      <a routerLink="/admin/billing" routerLinkActive="bg-[#8C3A5A] text-white" class="rounded-full border px-4 py-2 text-sm">Phí nền tảng</a>
    </nav>
  `,
})
export class AdminNavigationComponent {}
