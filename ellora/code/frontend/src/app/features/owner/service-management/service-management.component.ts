import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  duration: string;
  price: string;
  status: 'active' | 'inactive';
  iconType: 'nails' | 'art' | 'spa' | 'makeup' | 'eyelash';
}

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagement {
  
  // Categories
  categories = signal([
    { id: 'all', name: 'Tất cả' },
    { id: 'nails', name: 'Làm móng (Nails)' },
    { id: 'spa', name: 'Chăm sóc da (Spa)' },
    { id: 'eyelash', name: 'Nối mi (Eyelash)' },
    { id: 'makeup', name: 'Trang điểm (Makeup)' }
  ]);
  
  selectedCategory = signal<string>('all');

  // Mock Data
  allServices = signal<ServiceItem[]>([
    { id: 1, name: 'Sơn Gel Cao Cấp', category: 'nails', categoryLabel: 'NAILS', duration: '45 Phút', price: '350.000đ', status: 'active', iconType: 'nails' },
    { id: 2, name: 'Vẽ Móng Nghệ Thuật', category: 'nails', categoryLabel: 'ART', duration: '15+ Phút', price: 'Từ 50.000đ', status: 'active', iconType: 'art' },
    { id: 3, name: 'Massage Tay & Tẩy Tế Bào', category: 'spa', categoryLabel: 'SPA', duration: '25 Phút', price: '200.000đ', status: 'active', iconType: 'spa' },
    { id: 4, name: 'Đắp Móng Bột Tự Nhiên', category: 'nails', categoryLabel: 'NAILS', duration: '60 Phút', price: '450.000đ', status: 'active', iconType: 'nails' },
    { id: 5, name: 'Phủ Bóng Hàn Quốc', category: 'nails', categoryLabel: 'NAILS', duration: '30 Phút', price: '250.000đ', status: 'active', iconType: 'nails' },
    { id: 6, name: 'Chăm Sóc Da Mặt Chuyên Sâu', category: 'spa', categoryLabel: 'SPA', duration: '90 Phút', price: '650.000đ', status: 'active', iconType: 'spa' },
    { id: 7, name: 'Nối Mi Classic', category: 'eyelash', categoryLabel: 'LASH', duration: '60 Phút', price: '300.000đ', status: 'active', iconType: 'eyelash' },
    { id: 8, name: 'Nối Mi Volume', category: 'eyelash', categoryLabel: 'LASH', duration: '90 Phút', price: '450.000đ', status: 'active', iconType: 'eyelash' },
    { id: 9, name: 'Trang Điểm Cô Dâu', category: 'makeup', categoryLabel: 'MAKEUP', duration: '120 Phút', price: '1.500.000đ', status: 'active', iconType: 'makeup' },
    { id: 10, name: 'Trang Điểm Dự Tiệc', category: 'makeup', categoryLabel: 'MAKEUP', duration: '60 Phút', price: '500.000đ', status: 'active', iconType: 'makeup' },
    { id: 11, name: 'Tháo Móng Bột', category: 'nails', categoryLabel: 'NAILS', duration: '30 Phút', price: '100.000đ', status: 'active', iconType: 'nails' },
    { id: 12, name: 'Gội Đầu Dưỡng Sinh', category: 'spa', categoryLabel: 'SPA', duration: '45 Phút', price: '150.000đ', status: 'active', iconType: 'spa' },
    { id: 13, name: 'Đắp Mặt Nạ Vàng', category: 'spa', categoryLabel: 'SPA', duration: '30 Phút', price: '200.000đ', status: 'active', iconType: 'spa' },
    { id: 14, name: 'Uốn Mi Phủ Collagen', category: 'eyelash', categoryLabel: 'LASH', duration: '45 Phút', price: '250.000đ', status: 'active', iconType: 'eyelash' },
    { id: 15, name: 'Sơn Thạch', category: 'nails', categoryLabel: 'NAILS', duration: '45 Phút', price: '250.000đ', status: 'active', iconType: 'nails' },
    { id: 16, name: 'Nối Móng Úp', category: 'nails', categoryLabel: 'NAILS', duration: '60 Phút', price: '300.000đ', status: 'active', iconType: 'nails' },
    { id: 17, name: 'Massage Chân Ấn Huyệt', category: 'spa', categoryLabel: 'SPA', duration: '45 Phút', price: '300.000đ', status: 'inactive', iconType: 'spa' },
    { id: 18, name: 'Đính Đá Swarovski', category: 'nails', categoryLabel: 'ART', duration: '20 Phút', price: 'Từ 100.000đ', status: 'active', iconType: 'art' },
    { id: 19, name: 'Vẽ Gel Nổi 3D', category: 'nails', categoryLabel: 'ART', duration: '30 Phút', price: 'Từ 150.000đ', status: 'active', iconType: 'art' },
    { id: 20, name: 'Trang Điểm Cá Nhân', category: 'makeup', categoryLabel: 'MAKEUP', duration: '45 Phút', price: '350.000đ', status: 'active', iconType: 'makeup' },
    { id: 21, name: 'Tẩy Tế Bào Chết Toàn Thân', category: 'spa', categoryLabel: 'SPA', duration: '60 Phút', price: '450.000đ', status: 'active', iconType: 'spa' },
    { id: 22, name: 'Lấy Khóe Móng', category: 'nails', categoryLabel: 'NAILS', duration: '15 Phút', price: '50.000đ', status: 'inactive', iconType: 'nails' },
    { id: 23, name: 'Nối Mi Thiết Kế', category: 'eyelash', categoryLabel: 'LASH', duration: '90 Phút', price: '500.000đ', status: 'active', iconType: 'eyelash' },
    { id: 24, name: 'Sơn Móng Thường', category: 'nails', categoryLabel: 'NAILS', duration: '30 Phút', price: '100.000đ', status: 'active', iconType: 'nails' },
  ]);

  // Pagination State
  pageSize = signal<number>(5);
  currentPage = signal<number>(1);

  // Computed Derived State
  filteredServices = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') {
      return this.allServices();
    }
    return this.allServices().filter(s => s.category === cat);
  });

  paginatedServices = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredServices().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredServices().length / this.pageSize());
  });

  pagesArray = computed(() => {
    const count = this.totalPages();
    return Array.from({length: count}, (_, i) => i + 1);
  });

  // Actions
  selectCategory(categoryId: string) {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1); // Reset to page 1 when filtering
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
