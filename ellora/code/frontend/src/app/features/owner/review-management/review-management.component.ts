import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService, OwnerReview, ownerError } from '../../../services/owner-api.service';

export interface ReviewItem {
  id: number;
  customerName: string;
  customerInitials: string;
  timeAgo: string;
  rating: number; // 1 to 5
  staffName: string;
  staffAvatar?: string;
  content: string;
  images?: string[];
  isReplied: boolean;
  repliedTimeAgo?: string;
  reply?: string;
}

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-management.component.html',
  styleUrl: './review-management.component.scss'
})
export class ReviewManagement implements OnInit {
  private readonly api = inject(OwnerApiService);
  readonly error = signal('');
  readonly replyingId = signal<number | null>(null);
  replyText = '';
  saving = signal(false);
  async ngOnInit(): Promise<void> { await this.load(); }
  async load(): Promise<void> {
    try {
      const items: OwnerReview[] = [];
      for (let page = 0; page < 50; page++) {
        const result = await this.api.reviews(page);
        items.push(...result.content);
        if (result.last) break;
      }
      this.allReviews.set(items.map(item => ({
        id: item.id, customerName: item.customerName, customerInitials: item.customerName.slice(0, 2).toUpperCase(),
        timeAgo: new Date(item.createdAt).toLocaleDateString('vi-VN'), rating: item.rating, staffName: '—',
        content: item.comment, images: [], isReplied: item.salonReply != null || item.salonRepliedAt != null, reply: item.salonReply, repliedTimeAgo: item.salonRepliedAt ? new Date(item.salonRepliedAt).toLocaleDateString('vi-VN') : undefined
      })));
      this.ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({ stars, count: items.filter(item => item.rating === stars).length, percentage: items.length ? items.filter(item => item.rating === stars).length / items.length * 100 : 0 }));
      this.error.set('');
    } catch (error) { this.error.set(ownerError(error)); }
  }
  async sendReply(id: number): Promise<void> {
    if (this.saving() || this.allReviews().find(item => item.id === id)?.isReplied) return;
    if (!this.replyText.trim()) { this.error.set('Vui lòng nhập nội dung phản hồi.'); return; }
    this.saving.set(true);
    try { await this.api.reply(id, this.replyText.trim()); this.replyingId.set(null); this.replyText = ''; await this.load(); }
    catch (error) { this.error.set(ownerError(error)); }
    finally { this.saving.set(false); }
  }
  
  // Stats Data
  satisfactionRate = '—';
  growthRate = '—';
  topStaff = {
    name: '—',
    avatar: '/salon-placeholder.svg',
    mentions: 0
  };

  ratingDistribution = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  // Filter State
  activeFilter = signal<'all' | 'recent' | 'unanswered'>('all');

  // Lightbox State
  selectedImage = signal<string | null>(null);

  // Mock Data
  allReviews = signal<ReviewItem[]>([]);

  // Derived state based on filter
  filteredReviews = computed(() => {
    const filter = this.activeFilter();
    const reviews = this.allReviews();
    if (filter === 'unanswered') {
      return reviews.filter(r => !r.isReplied);
    }
    return reviews; // 'all' and 'recent' (we'll just show all since mock is sorted by recent)
  });

  // Pagination State
  pageSize = signal<number>(5);
  currentPage = signal<number>(1);

  paginatedReviews = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredReviews().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredReviews().length / this.pageSize());
  });

  pagesArray = computed(() => {
    const count = this.totalPages();
    return Array.from({length: count}, (_, i) => i + 1);
  });

  // Actions
  setFilter(filter: 'all' | 'recent' | 'unanswered') {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  openLightbox(imageUrl: string) {
    this.selectedImage.set(imageUrl);
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }

  closeLightbox() {
    this.selectedImage.set(null);
    document.body.style.overflow = 'auto'; // restore scrolling
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage() {
    const p = this.currentPage();
    if (p > 1) {
      this.currentPage.set(p - 1);
    }
  }

  nextPage() {
    const p = this.currentPage();
    if (p < this.totalPages()) {
      this.currentPage.set(p + 1);
    }
  }
}
