import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileApiService } from '../../../services/profile-api.service';
import { Profile } from './profile.component';
import { Component } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({standalone:true,template:'<h1>Admin section</h1>'})
class AdminPanelStub {}

describe('Profile database information', () => {
  it('keeps the account sidebar while replacing the personal form with admin content',async()=>{
    TestBed.configureTestingModule({providers:[provideRouter([
      {path:'profile',component:Profile,children:[{path:'users',component:AdminPanelStub},{path:'billing',component:AdminPanelStub}]},
    ]),{provide:ProfileApiService,useValue:{getCurrentUser:async()=>({id:'admin',fullName:'Admin',email:'admin@example.com',role:'ADMIN'})}}]});
    const harness=await RouterTestingHarness.create('/profile/users');await harness.fixture.whenStable();harness.detectChanges();
    const host=harness.routeNativeElement!;
    const menu=host.querySelector('nav')!;
    expect(menu.textContent).toContain('Quản lý người dùng');
    expect(host.textContent).toContain('Admin section');
    expect(host.querySelector('#profile-name')?.closest('[hidden]')).not.toBeNull();
    expect(menu.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/profile/users');
    await harness.navigateByUrl('/profile/billing');await harness.fixture.whenStable();harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('nav')).toBe(menu);
    expect(menu.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('/profile/billing');
    await harness.navigateByUrl('/profile');await harness.fixture.whenStable();harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#profile-name')?.closest('[hidden]')).toBeNull();
    expect(harness.routeNativeElement!.textContent).not.toContain('Admin section');
  });
  it('renders the API profile and shows an error instead of sample data on failure', async () => {
    let fail = false;
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [provideRouter([]), { provide: ProfileApiService, useValue: {
        getCurrentUser: async () => {
          if (fail) throw new Error('Unavailable');
          return { id: 'user-id', fullName: 'Nguyễn Linh', email: 'linh@example.com', phone: null, role: 'CUSTOMER' };
        },
      } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Profile);
    await fixture.whenStable();
    const inputs = fixture.nativeElement.querySelectorAll('form input') as NodeListOf<HTMLInputElement>;
    expect(Array.from(inputs).map(input => input.value)).toEqual(['Nguyễn Linh', 'linh@example.com', '']);
    expect(inputs[2].placeholder).toBe('Chưa cập nhật');
    const paymentButton = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(button => button.textContent?.includes('Payment Methods'))!;
    expect(paymentButton.type).toBe('button');
    expect(paymentButton.closest('a')).toBeNull();
    paymentButton.click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Chưa hỗ trợ quản lý phương thức thanh toán.');
    expect(fixture.componentInstance.user()?.fullName).toBe('Nguyễn Linh');
    fail = true;
    await fixture.componentInstance.loadProfile();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });
});
