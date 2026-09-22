import { Component, inject, signal, OnInit } from '@angular/core';
import { PhotoUpload } from '../../../shared/components/photo-upload.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OwnerApiService, OwnerSummary, ownerError } from '../../../services/owner-api.service';
import { SalonRegistration } from '../../../services/salon-registration.service';
import { OwnerRevenueComponent } from './revenue.component';
import { OwnerBillingComponent } from './billing.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoUpload, OwnerRevenueComponent, OwnerBillingComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: '../owner-data.scss',
})
export class Dashboard implements OnInit {
  private api = inject(OwnerApiService);
  salon = signal<SalonRegistration | null>(null);
  stats = signal<OwnerSummary | null>(null);
  loading = signal(true);
  error = signal('');
  photoBusy = signal(false);
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
      const [salon, stats] = await Promise.all([this.api.salon(), this.api.summary()]);
      this.salon.set(salon);
      this.stats.set(stats);
    } catch (e) {
      this.error.set(ownerError(e));
    } finally {
      this.loading.set(false);
    }
  }
}
