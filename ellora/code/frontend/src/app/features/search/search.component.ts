import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { SalonCard } from '../../shared/components/salon-card/salon-card.component';
import { Badge } from '../../shared/components/badge/badge.component';
import { SalonApiService } from '../../services/salon-api.service';
import { ActivatedRoute } from '@angular/router';
import { Salon } from '../../models/ellora.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SalonCard, Badge],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class Search implements OnInit {
  private dataService = inject(MockDataService);
  private salonApi = inject(SalonApiService);
  private route = inject(ActivatedRoute);
  
  salons = signal<Salon[]>([]);
  keyword = signal('');
  error = signal('');
  page = signal(0);
  total = signal(0);
  last = signal(true);
  categories = this.dataService.categories;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.keyword.set(params.get('keyword') ?? '');
      this.page.set(0);
      void this.search();
    });
  }

  async search(): Promise<void> {
    try {
      this.error.set('');
      const result = await this.salonApi.search(this.keyword(), this.page());
      this.salons.set(result.content); this.total.set(result.totalElements); this.last.set(result.last);
    }
    catch { this.salons.set([]); this.error.set('Không tải được salon. Vui lòng thử lại.'); }
  }

  move(delta: number): void {
    this.page.update(page => Math.max(0, page + delta));
    void this.search();
  }
}
