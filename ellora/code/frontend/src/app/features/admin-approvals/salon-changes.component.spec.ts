import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SalonChangesComponent } from './salon-changes.component';
import { SalonProfileComponent } from '../owner/salon-profile/salon-profile.component';
import { SalonChangePreviewComponent } from '../../shared/components/salon-change-preview.component';
import { SalonProfileChange, SalonRegistrationService } from '../../services/salon-registration.service';
import { OwnerApiService } from '../../services/owner-api.service';
import { apiConfig } from '../../config/api.config';

const profile={name:'Old salon',description:'',address:'Old address',city:'HCM',district:'Q1',phone:'',email:''};
const change:SalonProfileChange={id:7,salonId:42,salonName:'Old salon',current:profile,proposed:{...profile,name:'New salon'},
 status:'PENDING',kind:'PROFILE',submittedAt:'2026-09-25T10:00:00Z',reviewedAt:null,
 currentLogoUrl:'https://example.com/old.png',proposedLogoUrl:'https://example.com/new.png',currentImageUrls:[],proposedImageUrls:[]};

describe('Salon profile moderation',()=>{
 afterEach(()=>TestBed.resetTestingModule());
 it('shows before/after information and approves the immutable request id',async()=>{
  const api={changes:vi.fn().mockResolvedValue({content:[change],last:true}),decideChange:vi.fn().mockResolvedValue(undefined)};
  TestBed.configureTestingModule({providers:[{provide:SalonRegistrationService,useValue:api}]});
  const fixture=TestBed.createComponent(SalonChangesComponent);fixture.detectChanges();await fixture.whenStable();fixture.detectChanges();
  const button=[...fixture.nativeElement.querySelectorAll('button')].find((b:any)=>b.textContent.includes('Xem thay đổi')) as HTMLButtonElement;
  button.click();fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Old salon');expect(fixture.nativeElement.textContent).toContain('New salon');
  api.changes.mockResolvedValue({content:[],last:true});
  const approve=[...fixture.nativeElement.querySelectorAll('button')].find((b:any)=>b.textContent.includes('Duyệt cập nhật')) as HTMLButtonElement;
  approve.click();await fixture.whenStable();
  expect(api.decideChange).toHaveBeenCalledWith(7,'approve');expect(fixture.componentInstance.page()?.content).toEqual([]);
 });
 it('keeps the request visible when approval conflicts and allows rejection',async()=>{
  const api={changes:vi.fn().mockResolvedValue({content:[change],last:true}),decideChange:vi.fn().mockRejectedValue(new HttpErrorResponse({status:409,error:{message:'Ảnh đã thay đổi'}}))};
  TestBed.configureTestingModule({providers:[{provide:SalonRegistrationService,useValue:api}]});
  const component=TestBed.runInInjectionContext(()=>new SalonChangesComponent());await component.load();
  await component.decide(change,'approve');expect(component.error()).toBe('Ảnh đã thay đổi');expect(component.page()?.content).toHaveLength(1);
  api.decideChange.mockResolvedValue(undefined);api.changes.mockResolvedValue({content:[],last:true});
  await component.decide(change,'reject');expect(api.decideChange).toHaveBeenLastCalledWith(7,'reject');
 });
 it('renders current and proposed images, including a removal request',()=>{
  const fixture=TestBed.createComponent(SalonChangePreviewComponent);
  fixture.componentRef.setInput('change',{...change,kind:'COVER'});fixture.detectChanges();
  expect([...fixture.nativeElement.querySelectorAll('img')].map((img:any)=>img.src)).toEqual([change.currentLogoUrl,change.proposedLogoUrl]);
  fixture.componentRef.setInput('change',{...change,kind:'COVER',proposedLogoUrl:null});fixture.detectChanges();
  expect(fixture.nativeElement.querySelectorAll('img')).toHaveLength(1);expect(fixture.nativeElement.textContent).toContain('Xóa ảnh đại diện');
 });
 it('renders pending owner status after reload and prevents further edits',async()=>{
  const api={salon:vi.fn().mockResolvedValue({...profile,id:42,logoUrl:change.currentLogoUrl}),salonChange:vi.fn().mockResolvedValue(change)};
  TestBed.configureTestingModule({providers:[provideRouter([]),{provide:OwnerApiService,useValue:api}]});
  const fixture=TestBed.createComponent(SalonProfileComponent);fixture.detectChanges();
  await vi.waitFor(()=>expect(fixture.componentInstance.loading()).toBe(false));fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Đang chờ Admin duyệt');
  expect(fixture.nativeElement.querySelector('input[formcontrolname="name"]').disabled).toBe(true);
  expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
  expect(fixture.nativeElement.textContent).toContain('New salon');
 });
 it('uses owner identity endpoints and explicit admin decisions',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
  const owner=TestBed.inject(OwnerApiService),admin=TestBed.inject(SalonRegistrationService),http=TestBed.inject(HttpTestingController);
  const save=owner.saveSalon({...profile,name:'New salon'});const req=http.expectOne(apiConfig.baseUrl+'/owner/salon');
  expect(req.request.method).toBe('PUT');expect(req.request.body.salonId).toBeUndefined();req.flush({data:change});expect(await save).toEqual(change);
  const latest=owner.salonChange();http.expectOne(apiConfig.baseUrl+'/owner/salon/change-request').flush({data:change});await latest;
  const list=admin.changes(2);http.expectOne(apiConfig.baseUrl+'/admin/salon-changes?page=2').flush({data:{content:[change],last:true}});await list;
  const reject=admin.decideChange(7,'reject');const decision=http.expectOne(apiConfig.baseUrl+'/admin/salon-changes/7/reject');expect(decision.request.method).toBe('POST');decision.flush({});await reject;http.verify();
 });
});
