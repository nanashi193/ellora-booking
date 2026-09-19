import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OwnerApiService } from './owner-api.service';
import { BookingApiService } from './booking-api.service';
import { BookingService } from './booking.service';
import { ServiceManagement } from '../features/owner/service-management/service-management.component';
import { StaffManagement } from '../features/owner/staff-management/staff-management.component';

describe('Owner data', () => {
  const owner = { salon: vi.fn(), services: vi.fn(), employees: vi.fn(), saveService: vi.fn(), saveEmployee: vi.fn() };
  const bookings = { getSalonBookings: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks(); TestBed.configureTestingModule({providers:[{provide:OwnerApiService,useValue:owner},{provide:BookingApiService,useValue:bookings}]});
  });
  it('uses the current salon and clears previous notifications on empty results or failure', async () => {
    owner.salon.mockResolvedValue({id:42});
    bookings.getSalonBookings.mockResolvedValue({content:[{id:9}],totalElements:1});
    const service=TestBed.inject(BookingService); await service.loadSalonBookings();
    expect(bookings.getSalonBookings).toHaveBeenCalledWith(42,'PENDING',0,20);
    expect(service.pendingCount()).toBe(1);
    bookings.getSalonBookings.mockResolvedValue({content:[],totalElements:0}); await service.loadSalonBookings();
    expect(service.pendingBookings()).toEqual([]); expect(service.pendingCount()).toBe(0);
    bookings.getSalonBookings.mockRejectedValue(new Error('offline')); await service.loadSalonBookings();
    expect(service.pendingBookings()).toEqual([]); expect(service.error()).not.toBe('');
  });
  it('retains entered service data when saving fails and reloads after successful save', async () => {
    const component=TestBed.runInInjectionContext(()=>new ServiceManagement());
    component.edit(); component.form.setValue({name:'Sơn gel',price:150000,durationMinutes:45,description:'Màu tự chọn'});
    owner.saveService.mockRejectedValue(new Error('offline')); await component.save();
    expect(component.editing()).toBe(true); expect(component.form.getRawValue().name).toBe('Sơn gel'); expect(component.success()).toBe('');
    owner.saveService.mockResolvedValue(undefined); owner.services.mockResolvedValue([{id:17,name:'Sơn gel'}]); await component.save();
    expect(component.items()[0].id).toBe(17); expect(component.editing()).toBe(false);
  });
  it('blocks invalid employee input and refreshes persisted employees after saving', async () => {
    const component=TestBed.runInInjectionContext(()=>new StaffManagement());
    component.edit(); await component.save(); expect(owner.saveEmployee).not.toHaveBeenCalled();
    component.form.setValue({fullName:'Nhân viên mới',phone:'0901234567',bio:''});
    owner.saveEmployee.mockResolvedValue(undefined); owner.employees.mockResolvedValue([{id:8,fullName:'Nhân viên mới'}]);
    await component.save(); expect(component.items()[0].id).toBe(8); expect(component.success()).not.toBe('');
  });
});
