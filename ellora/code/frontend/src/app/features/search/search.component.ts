import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SalonApiService } from '../../services/salon-api.service';
import { Salon } from '../../models/ellora.model';
import { SalonCard } from '../../shared/components/salon-card/salon-card.component';
@Component({selector:'app-search',standalone:true,imports:[CommonModule,FormsModule,SalonCard],templateUrl:'./search.component.html',styleUrl:'./search.component.scss'})
export class Search implements OnInit {
 private api=inject(SalonApiService); private route=inject(ActivatedRoute); private router=inject(Router); private destroy=inject(DestroyRef); private request=0;
 salons=signal<Salon[]>([]);loading=signal(true);error=signal('');page=signal(0);last=signal(true);total=signal(0);keyword='';
 ngOnInit(){this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(params=>{this.keyword=params.get('q')||'';void this.load();});}
 search(){void this.router.navigate(['/search'],{queryParams:{q:this.keyword.trim()||null}});void this.load();}
 async load(page=0){const request=++this.request;this.loading.set(true);this.error.set('');this.salons.set([]);
 try{const result=await this.api.search(this.keyword.trim(),page);if(request!==this.request)return;this.salons.set(result.content);this.page.set(page);this.last.set(result.last);this.total.set(result.totalElements);}
 catch{if(request===this.request)this.error.set('Không tải được danh sách salon. Vui lòng thử lại.');}finally{if(request===this.request)this.loading.set(false);}}
}