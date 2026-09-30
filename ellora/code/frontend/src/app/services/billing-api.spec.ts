import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe,it,expect,vi,afterEach } from 'vitest';
import { BillingApiService,PlatformBill,vnMonth } from './billing-api.service';
import { OwnerRevenueComponent } from '../features/owner/dashboard/revenue.component';
import { apiConfig } from '../config/api.config';
import { AdminBillingComponent } from '../features/admin-content/billing.component';
describe('Revenue and billing',()=>{
 afterEach(()=>{vi.useRealTimers();TestBed.resetTestingModule();});
 function setup(){TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});return TestBed.inject(HttpTestingController);}
 it.each(['2024-02-15','2026-09-25','2028-12-17'])('sends the exact effective day %s',async(effectiveDate)=>{
  const http=setup(),api=TestBed.inject(BillingApiService);
  const promise=api.rate(3.25,effectiveDate);
  const request=http.expectOne(apiConfig.baseUrl+'/admin/billing/config');
  expect(request.request.body).toEqual({percent:3.25,effectiveDate});request.flush({data:{currentPercent:3.25,nextPercent:null,effectiveDate:null,qrUrl:null}});
  await promise;http.verify();
 });
 it('refreshes displayed debt after saving a backdated rate',async()=>{
  const http=setup(),component=TestBed.runInInjectionContext(()=>new AdminBillingComponent());
  component.percent=5;component.effectiveDate='2024-02-15';component.month='2024-02';
  const saving=component.saveRate();
  http.expectOne(apiConfig.baseUrl+'/admin/billing/config').flush({data:{currentPercent:5,nextPercent:null,effectiveDate:null,qrUrl:null}});
  await Promise.resolve();await Promise.resolve();
  http.expectOne(apiConfig.baseUrl+'/admin/billing/statements?month=2024-02&page=0').flush({data:{content:[{salonId:42,fee:2500,due:1000}],last:true}});
  await saving;expect(component.bills()[0].due).toBe(1000);expect(component.message()).toContain('15/02/2024');http.verify();
 });
 it('rejects a missing day before sending the rate',async()=>{
  const http=setup(),component=TestBed.runInInjectionContext(()=>new AdminBillingComponent());
  component.effectiveDate='';await component.saveRate();expect(component.error()).not.toBe('');http.verify();
 });
 it('uses Vietnam calendar dates and fills chart from server amounts',async()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date('2026-09-30T18:00:00Z'));expect(vnMonth()).toBe('2026-10');
  const http=setup();const component=TestBed.runInInjectionContext(()=>new OwnerRevenueComponent());
  component.preset('month');expect(component.from).toBe('2026-10-01');expect(component.to).toBe('2026-10-01');
  http.expectOne(r=>r.url===apiConfig.baseUrl+'/owner/revenue'&&r.params.get('groupBy')==='day').flush({data:{gross:50000,fee:1500,net:48500,completedBookings:1,estimatedBookings:0,points:[{date:'2026-10-01',gross:50000,fee:1500,net:48500,bookings:1}]}});
  await Promise.resolve();await Promise.resolve();
  expect(component.report()?.fee).toBe(1500);expect(component.chartData.datasets[2].data).toEqual([48500]);http.verify();
 });
 it('sends confirmation against the displayed month and exact outstanding amount',async()=>{
  const http=setup(),api=TestBed.inject(BillingApiService);
  const promise=api.confirm({salonId:42,month:'2026-10',due:1500} as PlatformBill);
  const request=http.expectOne(apiConfig.baseUrl+'/admin/billing/statements/42/confirm?month=2026-10');
  expect(request.request.body).toEqual({expectedDue:1500});request.flush({data:null});await promise;http.verify();
 });
});
