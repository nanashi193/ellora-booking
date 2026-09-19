import { Component, inject, signal, OnInit } from '@angular/core';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OwnerApiService, OwnerEmployee, ownerError } from '../../../services/owner-api.service';
@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhotoUpload],
  templateUrl: './staff-management.component.html',
  styleUrl: '../owner-data.scss',
})
export class StaffManagement implements OnInit {
  private readonly api = inject(OwnerApiService);
  private readonly fb = inject(FormBuilder);
  items = signal<OwnerEmployee[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  success = signal('');
  editing = signal(false);
  editingId: number | undefined;
  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', Validators.required],
    bio: ['', Validators.maxLength(500)],
  });
  ngOnInit() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    this.items.set([]);
    try {
      this.items.set(await this.api.employees());
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
  edit(item?: OwnerEmployee) {
    this.editingId = item?.id;
    this.form.reset(
      item
        ? { fullName: item.fullName, phone: item.phone, bio: item.bio || '' }
        : { fullName: '', phone: '', bio: '' },
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
      await this.api.saveEmployee(this.form.getRawValue(), this.editingId);
      this.editing.set(false);
      await this.load();
      this.success.set('Đã lưu thành công.');
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.saving.set(false);
    }
  }
  async remove(item: OwnerEmployee) {
    if (this.saving() || !confirm('Ngừng sử dụng mục này? Dữ liệu lịch hẹn cũ vẫn được giữ.'))
      return;
    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    try {
      await this.api.remove('employees', item.id);
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
