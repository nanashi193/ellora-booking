import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect } from 'vitest';
import { OwnerApiService } from './owner-api.service';
import { apiConfig } from '../config/api.config';
import { SalonApiService } from './salon-api.service';
import { AdminContentApiService } from './admin-content-api.service';
describe('Cloud photos',()=>{
 it('replaces and removes a gallery photo through the admin endpoint with its original URL',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
  const api=TestBed.inject(AdminContentApiService),http=TestBed.inject(HttpTestingController);
  const old='https://img/old.png';
  const upload=api.uploadPhoto(42,'gallery',42,new File(['bytes'],'new.png',{type:'image/png'}),old);
  const request=http.expectOne(apiConfig.baseUrl+'/admin/content/salons/42/photos/gallery/42');
  expect(request.request.body.get('oldUrl')).toBe(old);request.flush({data:'https://img/new.png'});
  expect(await upload).toBe('https://img/new.png');
  const remove=api.removePhoto(42,'gallery',42,old);
  const deletion=http.expectOne(r=>r.method==='DELETE'&&r.params.get('url')===old);deletion.flush({data:null});await remove;http.verify();
 });
 it('uploads binary multipart to the selected record and returns saved cloud URL',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
  const api=TestBed.inject(OwnerApiService),http=TestBed.inject(HttpTestingController);
  const file=new File(['bytes'],'sample.png',{type:'image/png'});const promise=api.uploadPhoto('services',42,file);
  const req=http.expectOne(apiConfig.baseUrl+'/owner/photos/services/42');
  expect(req.request.method).toBe('POST');expect(req.request.body instanceof FormData).toBe(true);expect(req.request.body.get('file').name).toBe('sample.png');
  req.flush({data:'https://res.cloudinary.com/demo/image/upload/sample.png'});expect(await promise).toContain('https://res.cloudinary.com/');http.verify();
 });
 it('shows cover first and preserves service and employee image URLs from API',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
  const api=TestBed.inject(SalonApiService),http=TestBed.inject(HttpTestingController);
  const salon=api.detail('42');http.expectOne(apiConfig.baseUrl+'/customer/salons/42').flush({data:{id:42,name:'Salon',logoUrl:'https://img/cover',imageUrls:['https://img/gallery']}});
  expect((await salon).images).toEqual(['https://img/cover','https://img/gallery']);
  const services=api.services('42');http.expectOne(apiConfig.baseUrl+'/customer/salons/42/services').flush({data:[{id:1,name:'Nails',imageUrl:'https://img/nails'}]});expect((await services)[0].imageUrl).toBe('https://img/nails');
  const employees=api.employees('42');http.expectOne(apiConfig.baseUrl+'/customer/salons/42/employees').flush({data:[{id:2,fullName:'Staff',avatarUrl:'https://img/staff'}]});expect((await employees)[0].avatar).toBe('https://img/staff');http.verify();
 });
});
