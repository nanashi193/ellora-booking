import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe,it,expect,vi,afterEach } from 'vitest';
import { ProfileApiService,Profile as UserProfile } from './profile-api.service';
import { AuthService } from './auth.service';
import { OwnerApiService } from './owner-api.service';
import { AdminUsersApiService,AdminUser } from './admin-users-api.service';
import { Profile } from '../features/customer/profile/profile.component';
import { SalonProfileComponent } from '../features/owner/salon-profile/salon-profile.component';
import { AdminUsersComponent } from '../features/admin-users/admin-users.component';
import { apiConfig } from '../config/api.config';

describe('Profile editing and user management',()=>{
 afterEach(()=>{vi.restoreAllMocks();TestBed.resetTestingModule();});
 it('uses current-user endpoints and sends only editable fields',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),{provide:AuthService,useValue:{}}]});
  const api=TestBed.inject(ProfileApiService),http=TestBed.inject(HttpTestingController);
  const saving=api.update({fullName:'Linh',phone:'0901234567'});
  const request=http.expectOne(apiConfig.baseUrl+'/profiles/me');expect(request.request.method).toBe('PUT');
  expect(request.request.body).toEqual({fullName:'Linh',phone:'0901234567'});request.flush({data:{fullName:'Linh'}});await saving;
  const file=new File(['image'],'avatar.png',{type:'image/png'}),upload=api.uploadAvatar(file);
  const image=http.expectOne(apiConfig.baseUrl+'/profiles/me/avatar');expect(image.request.body.get('file')).toBe(file);image.flush({data:{avatarUrl:'https://example.com/avatar.png'}});await upload;http.verify();
 });
 it('keeps profile edits on failure and updates only after a successful save',async()=>{
  const user={id:'1',fullName:'Old',email:'test@example.com',phone:'',role:'CUSTOMER'} as UserProfile;
  const api={getCurrentUser:vi.fn().mockResolvedValue(user),update:vi.fn().mockRejectedValue(new Error('offline'))};
  TestBed.configureTestingModule({providers:[{provide:ProfileApiService,useValue:api}]});
  const component=TestBed.runInInjectionContext(()=>new Profile());await component.loadProfile();
  component.form.setValue({fullName:'New',phone:'0901234567'});await component.save();
  expect(component.form.getRawValue().fullName).toBe('New');expect(component.user()?.fullName).toBe('Old');expect(component.saveError()).not.toBe('');
  api.update.mockResolvedValue({...user,fullName:'New',phone:'0901234567'});await component.save();
  expect(component.user()?.fullName).toBe('New');expect(component.form.pristine).toBe(true);
 });
 it('rejects invalid profile fields and invalid avatar without API writes',async()=>{
  const api={update:vi.fn(),uploadAvatar:vi.fn()};TestBed.configureTestingModule({providers:[{provide:ProfileApiService,useValue:api}]});
  const component=TestBed.runInInjectionContext(()=>new Profile());component.form.setValue({fullName:'  ',phone:'letters'});await component.save();expect(api.update).not.toHaveBeenCalled();
  component.chooseAvatar({target:{files:[new File(['text'],'file.txt',{type:'text/plain'})],value:'file'}} as unknown as Event);
  await component.uploadAvatar();expect(api.uploadAvatar).not.toHaveBeenCalled();expect(component.saveError()).toContain('JPG');
 });
 it('submits salon edits without changing the public profile before approval',async()=>{
  const salon={id:42,name:'Salon',description:null,address:'Address',city:'HCM',district:'Quận 1',phone:null,email:null,status:'ACTIVE'};
  const change={id:1,status:'PENDING',kind:'PROFILE',current:salon,proposed:{...salon,name:'New salon'}};
  const api={salon:vi.fn().mockResolvedValue(salon),salonChange:vi.fn().mockResolvedValue(null),saveSalon:vi.fn().mockResolvedValue(change)};
  TestBed.configureTestingModule({providers:[{provide:OwnerApiService,useValue:api}]});
  const component=TestBed.runInInjectionContext(()=>new SalonProfileComponent());await component.load();
  component.form.controls.name.setValue('New salon');await component.save();
  expect(api.saveSalon).toHaveBeenCalledWith({name:'New salon',description:'',address:'Address',city:'HCM',district:'Quận 1',phone:'',email:''});
  expect(component.salon()?.name).toBe('Salon');expect(component.change()?.proposed.name).toBe('New salon');expect(component.form.disabled).toBe(true);
  await component.save();expect(api.saveSalon).toHaveBeenCalledTimes(1);
  api.salonChange.mockResolvedValue(change);await component.load();expect(component.pending()).toBe(true);
  api.salon.mockResolvedValue({...salon,name:'New salon'});api.salonChange.mockResolvedValue({...change,status:'APPROVED'});
  await component.load();expect(component.salon()?.name).toBe('New salon');expect(component.form.enabled).toBe(true);
 });
 it('updates a user row after locking and prevents actions on admins',async()=>{
  const user={id:'user',fullName:'Linh',email:'linh@example.com',role:'CUSTOMER',locked:false} as AdminUser;
  const api={list:vi.fn().mockResolvedValue({content:[user],last:true}),lock:vi.fn().mockResolvedValue({...user,locked:true})};
  TestBed.configureTestingModule({providers:[{provide:AdminUsersApiService,useValue:api}]});
  const component=TestBed.runInInjectionContext(()=>new AdminUsersComponent());await component.load();vi.spyOn(window,'confirm').mockReturnValue(true);
  await component.toggle(user);expect(api.lock).toHaveBeenCalledWith('user',true);expect(component.users()[0].locked).toBe(true);
  await component.toggle({...user,role:'ADMIN'});expect(api.lock).toHaveBeenCalledTimes(1);
 });
 it('sends paginated user searches and explicit lock status',async()=>{
  TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
  const api=TestBed.inject(AdminUsersApiService),http=TestBed.inject(HttpTestingController);
  const list=api.list('Linh',2);http.expectOne(r=>r.url===apiConfig.baseUrl+'/admin/users'&&r.params.get('page')==='2'&&r.params.get('keyword')==='Linh').flush({data:{content:[],last:true}});await list;
  const unlock=api.lock('user',false);const request=http.expectOne(apiConfig.baseUrl+'/admin/users/user/lock');expect(request.request.method).toBe('PATCH');expect(request.request.body).toEqual({locked:false});request.flush({data:{id:'user',locked:false}});await unlock;http.verify();
 });
});
