import { Component, inject, input, output, signal, OnDestroy, Injector } from '@angular/core';
import { OwnerApiService } from '../../services/owner-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminContentApiService } from '../../services/admin-content-api.service';
@Component({
  selector: 'app-photo-upload',
  standalone: true,
  template: ` <div class="photo-upload">
    @if (previews().length) {
      <div class="preview-grid">
        @for (url of previews(); track url) { <img [src]="url" [alt]="label() + ' - ảnh đã chọn'" /> }
      </div>
    } @else if (imageUrl()) {
      <img [src]="imageUrl()" [alt]="label()" [class.avatar]="kind() === 'employees'" />
    }
    <label
      >{{ label()
      }}<input
        type="file"
        accept="image/jpeg,image/png"
        [multiple]="kind() === 'gallery' && !adminSalonId()"
        (change)="choose($event)"
        [disabled]="busy() || galleryFull()"
    /></label>
    @if (kind() === 'gallery' && !adminSalonId()) {
      <small>{{ existingCount() }} / {{ maxCount() }} ảnh. Chọn nhiều ảnh cùng lúc; mỗi ảnh JPG/PNG tối đa 5 MB.</small>
    } @else { <small>JPG hoặc PNG, tối đa 5 MB.</small> }
    @if (files().length) {
      <small>{{ files().length }} ảnh đã chọn</small>
      <button type="button" (click)="upload()" [disabled]="busy()">
        {{ busy() ? 'Đang tải ảnh…' : moderated() ? 'Gửi ' + files().length + ' ảnh để Admin duyệt' : 'Lưu ảnh' }}
      </button>
      <button type="button" (click)="cancelSelection()" [disabled]="busy()">Hủy chọn ảnh</button>
    }
    @if (imageUrl() && (kind() !== 'gallery' || adminSalonId())) {
      <button type="button" class="remove" (click)="remove()" [disabled]="busy()">{{moderated() ? 'Yêu cầu xóa ảnh' : 'Xóa ảnh'}}</button>
    }
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    @if (message()) {
      <p role="status">{{ message() }}</p>
    }
  </div>`,
  styles: [
    `
      .photo-upload {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 12px 0;
        max-width: 360px;
      }
      .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 8px; }
      .preview-grid img { width: 100%; aspect-ratio: 1; }
      img {
        width: min(240px, 100%);
        aspect-ratio: 4 / 3;
        height: auto;
        object-fit: cover;
        object-position: center;
        display: block;
        border-radius: 10px;
        border: 1px solid #eadfe3;
      }
      img.avatar { width: 112px; height: 112px; aspect-ratio: 1; border-radius: 50%; }
      label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-weight: 600;
      }
      input {
        max-width: 100%;
        font-size: 13px;
      }
      small {
        color: #756b70;
      }
      button {
        background: #8c3a5a;
        color: white;
        border: 0;
        border-radius: 8px;
        padding: 10px;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.5;
      }
      .remove { background: white; color: #a12238; border: 1px solid #e6b7c0; }
      p {
        font-size: 13px;
      }
      p[role='alert'] {
        color: #a12238;
      }
    `,
  ],
})
export class PhotoUpload implements OnDestroy {
  private api = inject(OwnerApiService);
  private injector = inject(Injector);
  private get admin() { return this.injector.get(AdminContentApiService); }
  adminSalonId = input<number>();
  existingCount = input(0);
  maxCount = input(10);
  kind = input.required<'cover' | 'gallery' | 'services' | 'employees'>();
  entityId = input.required<number>();
  imageUrl = input<string | null | undefined>();
  label = input('Chọn ảnh');
  saved = output<string>();
  files = signal<File[]>([]);
  previews = signal<string[]>([]);
  busy = signal(false);
  error = signal('');
  message = signal('');
  galleryFull() { return this.kind() === 'gallery' && !this.adminSalonId() && this.existingCount() >= this.maxCount(); }
  moderated(){return !this.adminSalonId() && (this.kind()==='cover'||this.kind()==='gallery');}
  private clear() {
    this.previews().forEach(url => URL.revokeObjectURL(url));
    this.previews.set([]);
    this.files.set([]);
  }
  cancelSelection() { this.clear(); this.error.set(''); this.message.set(''); }
  async remove() {
    const kind = this.kind();
    if ((kind === 'gallery' && !this.adminSalonId()) || this.busy() || !confirm(this.moderated() ? 'Gửi yêu cầu xóa ảnh? Ảnh chỉ được gỡ sau khi Admin duyệt.' : 'Xóa ảnh khỏi hồ sơ? Tệp gốc vẫn được giữ trên Cloudinary.')) return;
    this.busy.set(true); this.error.set(''); this.message.set('');
    try {
      const salon = this.adminSalonId();
      if (salon) await this.admin.removePhoto(salon, kind, this.entityId(), this.imageUrl() || undefined);
      else if (kind !== 'gallery') await this.api.removePhoto(kind, this.entityId());
      this.clear(); this.message.set(this.moderated() ? 'Đã gửi yêu cầu xóa ảnh, chờ Admin duyệt.' : 'Đã xóa ảnh khỏi hồ sơ.'); this.saved.emit('');
    } catch(e) { this.error.set(e instanceof HttpErrorResponse && typeof e.error?.message==='string' ? e.error.message : 'Không xóa được ảnh. Vui lòng thử lại.'); }
    finally { this.busy.set(false); }
  }
  choose(event: Event) {
    this.clear();
    this.error.set('');
    this.message.set('');
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    input.value = '';
    if (!files.length) return;
    if (files.some(file => !['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      this.error.set('Tất cả ảnh phải là JPG/PNG và không quá 5 MB mỗi ảnh.');
      return;
    }
    const isOwnerGallery = this.kind() === 'gallery' && !this.adminSalonId();
    const remaining = this.maxCount() - this.existingCount();
    if (isOwnerGallery && files.length > remaining) {
      this.error.set(`Tiệm còn chỗ cho ${remaining} ảnh nữa. Vui lòng chọn không quá ${remaining} ảnh.`);
      return;
    }
    this.files.set(files);
    this.previews.set(files.map(file => URL.createObjectURL(file)));
  }
  async upload() {
    const files = this.files();
    if (!files.length || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const salon = this.adminSalonId();
      const ownerGallery = !salon && this.kind() === 'gallery';
      const urls = salon
        ? [await this.admin.uploadPhoto(salon, this.kind(), this.entityId(), files[0], this.kind() === 'gallery' ? this.imageUrl() || undefined : undefined)]
        : ownerGallery
          ? await this.api.uploadGallery(this.entityId(), files)
          : [await this.api.uploadPhoto(this.kind(), this.entityId(), files[0])];
      this.clear();
      this.message.set(this.moderated()
        ? `Đã gửi ${urls.length} ảnh, chờ Admin duyệt. Bộ ảnh hiện tại vẫn được giữ nguyên.`
        : `Đã lưu ${urls.length} ảnh.`);
      this.saved.emit(urls[urls.length - 1]);
    } catch (e) {
      this.error.set(
        e instanceof HttpErrorResponse && typeof e.error?.message === 'string'
          ? e.error.message
          : 'Không tải được ảnh. Vui lòng thử lại.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  ngOnDestroy() {
    this.clear();
  }
}
