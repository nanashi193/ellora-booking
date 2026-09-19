import { Component, inject, signal, OnInit } from '@angular/core';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerApiService, OwnerService, ownerError } from '../../../services/owner-api.service';
@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhotoUpload],
  templateUrl: './service-management.component.html',
  styleUrl: '../owner-data.scss',
})
export class ServiceManagement implements OnInit {
  private readonly api = inject(OwnerApiService);
  private readonly fb = inject(FormBuilder);
  items = signal<OwnerService[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');
  editing = signal(false);
  editingId: number | undefined;
  private categoryId: number | null = null;
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    price: [100000, [Validators.required, Validators.min(1)]],
    durationMinutes: [30, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.maxLength(1000)],
  });
  ngOnInit() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    this.items.set([]);
    try {
      this.items.set(await this.api.services());
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
  edit(item?: OwnerService) {
    this.categoryId = item?.categoryId ?? null;
    this.editingId = item?.id;
    this.form.reset(
      item
        ? {
            name: item.name,
            price: item.price,
            durationMinutes: item.durationMinutes,
            description: item.description || '',
          }
        : { name: '', price: 100000, durationMinutes: 30, description: '' },
    );
    this.editing.set(true);
    this.success.set('');
    this.error.set('');
  }
  async save() {
    if (this.saving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.api.saveService(
        { ...this.form.getRawValue(), categoryId: this.categoryId },
        this.editingId,
      );
      this.editing.set(false);
      await this.load();
      this.success.set('Đã lưu thành công.');
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.saving.set(false);
    }
  }
  async remove(item: OwnerService) {
    if (this.saving() || !confirm('Ngừng sử dụng mục này? Dữ liệu lịch hẹn cũ vẫn được giữ.'))
      return;
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.api.remove('services', item.id);
      this.editing.set(false);
      await this.load();
      this.success.set('Đã ngừng sử dụng.');
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.saving.set(false);
    }
  }
}
