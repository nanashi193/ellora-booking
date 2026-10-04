import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookingApiService, BookingItem } from '../../../services/booking-api.service';
import { MyBookings } from './my-bookings.component';

describe('Customer reviews', () => {
  const api = { reviewBooking: vi.fn(), getMyBookings: vi.fn() };
  let component: MyBookings;
  const booking = {id:1, status:'COMPLETED', reviewed:false} as BookingItem;
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({providers:[{provide:BookingApiService,useValue:api}]});
    component = TestBed.runInInjectionContext(() => new MyBookings());
    component.bookings.set([booking]);
  });
  afterEach(() => { component.ngOnDestroy(); vi.useRealTimers(); vi.restoreAllMocks(); });
  it('refreshes status without losing review drafts, retries errors and stops on destroy', async () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    api.getMyBookings.mockResolvedValue({content:[{...booking,status:'CONFIRMED'}],last:true});
    await component.ngOnInit();
    component.reviewId.set(9); component.comment='Đang viết'; component.rating=4;
    api.getMyBookings.mockResolvedValue({content:[{...booking,status:'IN_PROGRESS'}],last:true});
    await vi.advanceTimersByTimeAsync(5000);
    expect(component.bookings()[0].status).toBe('IN_PROGRESS');
    expect(component.comment).toBe('Đang viết'); expect(component.reviewId()).toBe(9);
    api.getMyBookings.mockRejectedValue(new Error('offline'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(component.bookings()[0].status).toBe('IN_PROGRESS');
    expect(component.refreshWarning()).not.toBe('');
    api.getMyBookings.mockResolvedValue({content:[booking],last:true});
    await vi.advanceTimersByTimeAsync(5000);
    expect(component.bookings()[0].status).toBe('COMPLETED');
    expect(component.refreshWarning()).toBe('');
    component.ngOnDestroy(); const calls=api.getMyBookings.mock.calls.length;
    await vi.advanceTimersByTimeAsync(10000);
    expect(api.getMyBookings).toHaveBeenCalledTimes(calls);
  });
  it('ignores an old refresh after navigating to another page', async () => {
    vi.useFakeTimers(); vi.spyOn(document,'hidden','get').mockReturnValue(false);
    api.getMyBookings.mockResolvedValue({content:[booking],last:false});
    await component.ngOnInit();
    let resolve!: (value: unknown) => void;
    api.getMyBookings.mockReturnValueOnce(new Promise(r => resolve=r));
    await vi.advanceTimersByTimeAsync(5000);
    api.getMyBookings.mockResolvedValue({content:[{...booking,id:22}],last:true});
    await component.loadBookings(1);
    resolve({content:[booking],last:false}); await Promise.resolve();
    expect(component.bookings()[0].id).toBe(22); expect(component.pageNumber()).toBe(1);
  });
  it('only opens completed, unreviewed bookings and requires a rating', async () => {
    component.openReview({...booking,status:'CONFIRMED'}); expect(component.reviewId()).toBeNull();
    component.openReview({...booking,reviewed:true}); expect(component.reviewId()).toBeNull();
    component.openReview(booking); await component.submitReview();
    expect(api.reviewBooking).not.toHaveBeenCalled(); expect(component.reviewError()).not.toBe('');
  });
  it('retains input on failure and marks successful reviews to prevent another submission', async () => {
    component.openReview(booking); component.rating=4; component.comment=' Tốt ';
    api.reviewBooking.mockRejectedValue(new Error('offline')); await component.submitReview();
    expect(component.reviewId()).toBe(1); expect(component.comment).toBe(' Tốt ');
    api.reviewBooking.mockResolvedValue(undefined); await component.submitReview();
    expect(api.reviewBooking).toHaveBeenLastCalledWith(1,4,'Tốt');
    expect(component.bookings()[0].reviewed).toBe(true); expect(component.reviewId()).toBeNull();
  });
});
