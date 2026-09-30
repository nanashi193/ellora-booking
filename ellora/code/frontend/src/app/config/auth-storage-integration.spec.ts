import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { defaultStorage, sessionStorage as amplifySessionStorage } from 'aws-amplify/utils';
import { cognitoConfig, configureCognito, selectAuthStorage } from './cognito.config';
import { AuthService } from '../services/auth.service';

// Real SDK with synthetic, unexpired client-side tokens. No requests to Cognito.
describe('Real Amplify session restoration', () => {
  beforeEach(() => {
    window.localStorage.clear(); window.sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network must not be used in session restoration tests'); }));
  });
  afterEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); vi.unstubAllGlobals(); });

  async function seed(remember: boolean) {
    const storage = remember ? defaultStorage : amplifySessionStorage;
    const prefix = `CognitoIdentityServiceProvider.${cognitoConfig.userPoolClientId}`;
    const payload = { sub: 'test-user', exp: Math.floor(Date.now()/1000)+3600, iat: Math.floor(Date.now()/1000) };
    const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const token = `${encode({alg:'none'})}.${encode(payload)}.test-signature`;
    await storage.setItem(`${prefix}.LastAuthUser`, 'test-user');
    await storage.setItem(`${prefix}.test-user.accessToken`, token);
    return token;
  }

  it('reproduces SDK resetting session storage and verifies F5 recovery', async () => {
    configureCognito();selectAuthStorage(false);
    const token=await seed(false);
    expect(await new AuthService().isAuthenticated()).toBe(true);
    Amplify.configure(Amplify.getConfig());
    expect((await fetchAuthSession()).tokens).toBeUndefined();
    configureCognito();
    expect(await new AuthService().isAuthenticated()).toBe(true);
    expect(await new AuthService().getAccessToken()).toBe(token);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('restores a remembered session after startup configuration', async () => {
    configureCognito();selectAuthStorage(true);const token=await seed(true);
    configureCognito();expect(await new AuthService().getAccessToken()).toBe(token);
  });

  it('recovers non-remembered sessions created before the preference marker', async () => {
    const token=await seed(false);configureCognito();
    expect(await new AuthService().getAccessToken()).toBe(token);
  });
});
