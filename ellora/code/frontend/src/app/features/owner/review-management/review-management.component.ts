import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
}

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-management.component.html',
  styleUrl: './review-management.component.scss'
})
export class ReviewManagement {
  
  // Stats Data
  satisfactionRate = 95;
  growthRate = 2.4;
  topStaff = {
    name: 'Linh Nguyễn',
    avatar: 'https://ui-avatars.com/api/?name=Linh+Nguyen&background=random',
    mentions: 24
  };

  ratingDistribution = [
    { stars: 5, count: 124, percentage: 88.5 },
    { stars: 4, count: 16, percentage: 11.4 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ];

  // Filter State
  activeFilter = signal<'all' | 'recent' | 'unanswered'>('all');

  // Lightbox State
  selectedImage = signal<string | null>(null);

  // Mock Data
  allReviews = signal<ReviewItem[]>([
    {
      id: 1,
      customerName: 'Minh Hạnh',
      customerInitials: 'MH',
      timeAgo: '2 giờ trước',
      rating: 5,
      staffName: 'Linh Nguyễn',
      staffAvatar: 'https://ui-avatars.com/api/?name=Linh+Nguyen&background=random',
      content: 'Trải nghiệm tuyệt vời tại Ellora! Linh làm móng rất kỹ và nhẹ nhàng. Mình cực kỳ ưng bộ móng ombre hồng lần này, đúng như ý muốn. Không gian salon sang trọng và thư giãn, trà thơm rất ngon. Chắc chắn sẽ quay lại!',
      images: [
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400'
      ],
      isReplied: false
    },
    {
      id: 2,
      customerName: 'Anh ThW',
      customerInitials: 'AT',
      timeAgo: '5 giờ trước',
      rating: 4,
      staffName: 'Mai Ka',
      staffAvatar: 'https://ui-avatars.com/api/?name=Mai+Ka&background=random',
      content: 'Rất hài lòng với dịch vụ chăm sóc da tay và sơn gel. Màu sơn bền, bóng đẹp. Tuy nhiên hôm nay tiệm hơi đông nên mình phải chờ khoảng 10 phút dù đã đặt lịch trước. Bù lại nhân viên rất nhiệt tình xin lỗi và phục vụ nước uống chu đáo.',
      isReplied: true,
      repliedTimeAgo: '1 giờ trước'
    },
    {
      id: 3,
      customerName: 'Nguyễn Thị Hoa',
      customerInitials: 'NH',
      timeAgo: '1 ngày trước',
      rating: 5,
      staffName: 'Vũ Minh Đức',
      content: 'Chăm sóc móng xuất sắc. Nhân viên nhiệt tình, tư vấn màu sơn rất hợp với tone da của mình. Sẽ giới thiệu bạn bè tới đây.',
      isReplied: true,
      repliedTimeAgo: '20 giờ trước'
    },
    {
      id: 4,
      customerName: 'Trần Bích Phương',
      customerInitials: 'TP',
      timeAgo: '2 ngày trước',
      rating: 3,
      staffName: 'Đặng Mai Phương',
      content: 'Màu sơn đẹp nhưng nhân viên làm hơi vội vàng, có một ngón bị lem một chút xíu. Hy vọng lần sau tiệm sẽ làm cẩn thận hơn.',
      isReplied: false
    },
    {
      id: 5,
      customerName: 'Lê Ngọc Lan',
      customerInitials: 'LL',
      timeAgo: '3 ngày trước',
      rating: 5,
      staffName: 'Linh Nguyễn',
      staffAvatar: 'https://ui-avatars.com/api/?name=Linh+Nguyen&background=random',
      content: 'Linh làm móng siêu đỉnh! Mình rất thích không gian nhẹ nhàng của Ellora.',
      images: [
        'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=400'
      ],
      isReplied: false
    },
    {
      id: 6,
      customerName: 'Hoàng Yến',
      customerInitials: 'HY',
      timeAgo: '4 ngày trước',
      rating: 5,
      staffName: 'Phạm Hải Đăng',
      content: 'Mình làm combo chăm sóc chân và sơn gel. Tuyệt vời!',
      isReplied: true,
      repliedTimeAgo: '3 ngày trước'
    }
  ]);

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
