import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwnerApiService, OwnerService, ownerError } from '../../../services/owner-api.service';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';

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
  imports: [CommonModule, FormsModule, PhotoUpload],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagement implements OnInit {
  private readonly api = inject(OwnerApiService);
  readonly rawServices = signal<OwnerService[]>([]);
  readonly activeCount = computed(() => this.rawServices().filter(item => item.active).length);
  readonly averagePrice = computed(() => this.rawServices().length ? `${Math.round(this.rawServices().reduce((sum, item) => sum + item.price, 0) / this.rawServices().length).toLocaleString('vi-VN')}đ` : '—');
  readonly error = signal('');
  readonly editorOpen = signal(false);
  editingId: number | null = null;
  draft: { name: string; description: string; price: number; durationMinutes: number; categoryId: number | null } = { name: '', description: '', price: 0, durationMinutes: 30, categoryId: null };

  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    try {
      const data = await this.api.services();
      this.rawServices.set(data);
      this.allServices.set(data.map(service => ({
        id: service.id, name: service.name, category: 'all', categoryLabel: 'DỊCH VỤ',
        duration: `${service.durationMinutes} Phút`, price: `${service.price.toLocaleString('vi-VN')}đ`,
        status: service.active ? 'active' : 'inactive', iconType: 'nails'
      })));
      this.error.set('');
    } catch (error) { this.error.set(ownerError(error)); }
  }
  edit(service?: OwnerService): void {
    this.editingId = service?.id ?? null;
    this.draft = { name: service?.name ?? '', description: service?.description ?? '', price: service?.price ?? 0, durationMinutes: service?.durationMinutes ?? 30, categoryId: service?.categoryId ?? null };
    this.editorOpen.set(true);
  }
  async save(): Promise<void> {
    if (this.draft.name.trim().length < 2 || this.draft.description.length > 1000 || this.draft.price <= 0 || this.draft.durationMinutes <= 0) { this.error.set('Vui lòng kiểm tra tên, mô tả, giá và thời lượng dịch vụ.'); return; }
    try { await this.api.saveService(this.draft, this.editingId ?? undefined); this.editorOpen.set(false); await this.load(); }
    catch (error) { this.error.set(ownerError(error)); }
  }
  async remove(id: number): Promise<void> {
    if (!confirm('Xóa dịch vụ này?')) return;
    try { await this.api.remove('services', id); await this.load(); }
    catch (error) { this.error.set(ownerError(error)); }
  }
  
  // Categories
  categories = signal([
    { id: 'all', name: 'Tất cả' }
  ]);
  
  selectedCategory = signal<string>('all');

  allServices = signal<ServiceItem[]>([]);

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
