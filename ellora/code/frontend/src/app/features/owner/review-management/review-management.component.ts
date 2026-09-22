import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService, OwnerReview, ownerError } from '../../../services/owner-api.service';
@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-management.component.html',
  styleUrl: '../owner-data.scss',
})
export class ReviewManagement implements OnInit {
  private api = inject(OwnerApiService);
  items = signal<OwnerReview[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  page = signal(0);
  last = signal(true);
  replies: Record<number, string> = {};
  ngOnInit() {
    void this.load();
  }
  async load(page = 0) {
    this.loading.set(true);
    this.error.set('');
    this.items.set([]);
    try {
      const result = await this.api.reviews(page);
      this.items.set(result.content);
      this.page.set(page);
      this.last.set(result.last);
      this.replies = {};
      for (const item of result.content) this.replies[item.id] = item.salonReply || '';
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
  async reply(item: OwnerReview) {
    const reply = (this.replies[item.id] || '').trim();
    if (!reply || this.saving() || item.salonReply != null || item.salonRepliedAt != null) return;
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.reply(item.id, reply);
      this.items.update(items => items.map(review => review.id === item.id ? {...review, salonReply: reply} : review));
      await this.load(this.page());
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
