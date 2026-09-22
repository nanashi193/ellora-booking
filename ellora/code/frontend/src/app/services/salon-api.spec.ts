import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { SalonApiService } from './salon-api.service';
import { apiConfig } from '../config/api.config';
describe('Public salon API',()=>{
 let api:SalonApiService;let http:HttpTestingController;
 beforeEach(()=>{TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});api=TestBed.inject(SalonApiService);http=TestBed.inject(HttpTestingController);});
 afterEach(()=>http.verify());
 it('preserves salon replies and their dates for customer display',async()=>{
  const result=api.reviews('1');
  http.expectOne(apiConfig.baseUrl+'/customer/salons/1/reviews?page=0').flush({data:{content:[{id:7,customerName:'Khách',rating:5,comment:'Tốt',createdAt:'2026-09-22T10:00:00',salonReply:'Cảm ơn bạn!',salonRepliedAt:'2026-09-22T11:00:00'}],last:true}});
  const review=(await result).content[0];
  expect(review.salonReply).toBe('Cảm ơn bạn!');expect(review.salonRepliedAt).toBe('2026-09-22T11:00:00');
 });
 it('maps actual DB IDs and missing images without invented ratings or availability',async()=>{
  const result=api.search('Salon thật',0,12);
  http.expectOne(r=>r.url.includes('/customer/salons?keyword=')).flush({data:{content:[{id:42,name:'Salon thật',address:'Quận 1',city:'HCM',averageRating:0,totalReviews:0}],last:true,totalElements:1,pageNumber:0}});
  const salon=(await result).content[0];expect(salon.id).toBe('42');expect(salon.images).toEqual([]);expect(salon.isOpen).toBeUndefined();expect(salon.reviewCount).toBe(0);
 });
 it('preserves empty results and rejects errors instead of returning sample salons',async()=>{
  const empty=api.search();http.expectOne(r=>r.url.includes('/customer/salons?')).flush({data:{content:[],last:true,totalElements:0,pageNumber:0}});expect((await empty).content).toEqual([]);
  const failed=api.detail('42');const assertion=expect(failed).rejects.toBeDefined();http.expectOne(apiConfig.baseUrl+'/customer/salons/42').flush({}, {status:404,statusText:'Not Found'});await assertion;
 });
});
