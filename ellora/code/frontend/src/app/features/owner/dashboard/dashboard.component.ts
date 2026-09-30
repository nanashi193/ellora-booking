import { Component, inject, signal, OnInit } from '@angular/core';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerApiService, OwnerSummary, OwnerWorkingHour, ownerError } from '../../../services/owner-api.service';
import { SalonRegistration } from '../../../services/salon-registration.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoUpload],
  templateUrl: './dashboard.component.html',
  styleUrl: '../owner-data.scss',
})
export class Dashboard implements OnInit {
  private api = inject(OwnerApiService);
  salon = signal<SalonRegistration | null>(null);
  stats = signal<OwnerSummary | null>(null);
  workingHours = signal<OwnerWorkingHour[]>([]);
  hoursMessage = signal('');
  savingHours = signal(false);
  readonly weekdays = [
    { key: 'MONDAY', label: 'Thứ Hai' }, { key: 'TUESDAY', label: 'Thứ Ba' },
    { key: 'WEDNESDAY', label: 'Thứ Tư' }, { key: 'THURSDAY', label: 'Thứ Năm' },
    { key: 'FRIDAY', label: 'Thứ Sáu' }, { key: 'SATURDAY', label: 'Thứ Bảy' },
    { key: 'SUNDAY', label: 'Chủ Nhật' },
  ];
  loading = signal(true);
  error = signal('');
  photoBusy = signal(false);
  photoMessage = signal('');
  async photosChanged() {
    try {
      this.salon.set(await this.api.salon());
    } catch (e) {
      this.error.set(ownerError(e));
    }
  }
  async removeImage(url: string) {
    if (this.photoBusy()) return;
    this.photoBusy.set(true);
    this.error.set('');
    try {
      await this.api.removeGallery(url);
      this.photoMessage.set('Đã gửi yêu cầu xóa ảnh. Ảnh vẫn hiển thị cho đến khi Admin duyệt.');
      await this.photosChanged();
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.photoBusy.set(false);
    }
  }
  ngOnInit() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    this.error.set('');
    this.stats.set(null);
    try {
      const [salon, stats, hours] = await Promise.all([this.api.salon(), this.api.summary(), this.api.workingHours()]);
      this.salon.set(salon);
      this.stats.set(stats);
      this.workingHours.set(hours);
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
  updateHour(day: string, changes: Partial<OwnerWorkingHour>) {
    this.workingHours.update(hours => hours.map(hour => hour.dayOfWeek === day ? { ...hour, ...changes } : hour));
  }
  hourFor(day: string) { return this.workingHours().find(hour => hour.dayOfWeek === day); }
  async saveHours() {
    if (this.savingHours()) return;
    this.savingHours.set(true);
    this.hoursMessage.set('');
    try {
      this.workingHours.set(await this.api.saveWorkingHours(this.workingHours()));
      this.hoursMessage.set('Đã lưu giờ hoạt động.');
    } catch (error) {
      this.error.set(ownerError(error));
    } finally {
      this.savingHours.set(false);
    }
  }
}
