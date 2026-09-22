import { Component, inject, input, output, signal, OnDestroy, Injector } from '@angular/core';
import { OwnerApiService } from '../../services/owner-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminContentApiService } from '../../services/admin-content-api.service';
@Component({
  selector: 'app-photo-upload',
  standalone: true,
  template: ` <div class="photo-upload">
    @if (preview() || imageUrl()) {
      <img [src]="preview() || imageUrl()" [alt]="label()" [class.avatar]="kind() === 'employees'" />
    }
    <label
      >{{ label()
      }}<input
        type="file"
        accept="image/jpeg,image/png"
        (change)="choose($event)"
        [disabled]="busy()"
    /></label>
    <small>JPG hoặc PNG, tối đa 5 MB.</small>
    @if (file()) {
      <button type="button" (click)="upload()" [disabled]="busy()">
        {{ busy() ? 'Đang tải ảnh…' : 'Lưu ảnh' }}
      </button>
      <button type="button" (click)="cancelSelection()" [disabled]="busy()">Hủy chọn ảnh</button>
    }
    @if (imageUrl() && (kind() !== 'gallery' || adminSalonId())) {
      <button type="button" class="remove" (click)="remove()" [disabled]="busy()">Xóa ảnh</button>
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
  kind = input.required<'cover' | 'gallery' | 'services' | 'employees'>();
  entityId = input.required<number>();
  imageUrl = input<string | null | undefined>();
  label = input('Chọn ảnh');
  saved = output<string>();
  file = signal<File | null>(null);
  preview = signal('');
  busy = signal(false);
  error = signal('');
  message = signal('');
  private clear() {
    if (this.preview()) URL.revokeObjectURL(this.preview());
    this.preview.set('');
    this.file.set(null);
  }
  cancelSelection() { this.clear(); this.error.set(''); this.message.set(''); }
  async remove() {
    const kind = this.kind();
    if ((kind === 'gallery' && !this.adminSalonId()) || this.busy() || !confirm('Xóa ảnh khỏi hồ sơ? Tệp gốc vẫn được giữ trên Cloudinary.')) return;
    this.busy.set(true); this.error.set(''); this.message.set('');
    try {
      const salon = this.adminSalonId();
      if (salon) await this.admin.removePhoto(salon, kind, this.entityId(), this.imageUrl() || undefined);
      else if (kind !== 'gallery') await this.api.removePhoto(kind, this.entityId());
      this.clear(); this.message.set('Đã xóa ảnh khỏi hồ sơ.'); this.saved.emit('');
    } catch { this.error.set('Không xóa được ảnh. Vui lòng thử lại.'); }
    finally { this.busy.set(false); }
  }
  choose(event: Event) {
    this.clear();
    this.error.set('');
    this.message.set('');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error.set('Chọn ảnh JPG/PNG không quá 5 MB.');
      return;
    }
    this.file.set(file);
    this.preview.set(URL.createObjectURL(file));
  }
  async upload() {
    const file = this.file();
    if (!file || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    try {
      const salon = this.adminSalonId();
      const url = salon
        ? await this.admin.uploadPhoto(salon, this.kind(), this.entityId(), file, this.kind() === 'gallery' ? this.imageUrl() || undefined : undefined)
        : await this.api.uploadPhoto(this.kind(), this.entityId(), file);
      this.clear();
      this.message.set('Đã lưu ảnh.');
      this.saved.emit(url);
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
