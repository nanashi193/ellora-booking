import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('aws-amplify/auth/cognito', () => ({ cognitoUserPoolsTokenProvider: { setKeyValueStorage: vi.fn() } }));
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { defaultStorage, sessionStorage as amplifySessionStorage } from 'aws-amplify/utils';
import { cognitoConfig, configureCognito, selectAuthStorage } from './cognito.config';

describe('Authentication storage after page reload', () => {
  beforeEach(() => { window.sessionStorage.clear(); vi.clearAllMocks(); });
  it('restores a non-remembered session after Cognito configures its defaults', async () => {
    selectAuthStorage(false);
    await amplifySessionStorage.setItem('test-session', 'session-value');
    vi.clearAllMocks();
    configureCognito();
    expect(cognitoUserPoolsTokenProvider.setKeyValueStorage).toHaveBeenCalledWith(amplifySessionStorage);
    expect(await amplifySessionStorage.getItem('test-session')).toBe('session-value');
    expect(vi.mocked(cognitoUserPoolsTokenProvider.setKeyValueStorage).mock.invocationCallOrder[0])
      .toBeGreaterThan(vi.mocked(Amplify.configure).mock.invocationCallOrder[0]);
  });
  it('restores remembered login to local storage', () => {
    selectAuthStorage(true);vi.clearAllMocks();configureCognito();
    expect(cognitoUserPoolsTokenProvider.setKeyValueStorage).toHaveBeenCalledWith(defaultStorage);
  });
  it('recovers an existing session created before this fix', () => {
    window.sessionStorage.setItem(`CognitoIdentityServiceProvider.${cognitoConfig.userPoolClientId}.LastAuthUser`, 'test-user');
    configureCognito();
    expect(cognitoUserPoolsTokenProvider.setKeyValueStorage).toHaveBeenCalledWith(amplifySessionStorage);
  });
  it('honors an explicit local choice even if an old session entry exists', () => {
    window.sessionStorage.setItem(`CognitoIdentityServiceProvider.${cognitoConfig.userPoolClientId}.LastAuthUser`, 'old-user');
    selectAuthStorage(true);vi.clearAllMocks();configureCognito();
    expect(cognitoUserPoolsTokenProvider.setKeyValueStorage).toHaveBeenCalledWith(defaultStorage);
  });
  it('defaults to persistent storage in a new browser tab', () => {
    configureCognito();expect(cognitoUserPoolsTokenProvider.setKeyValueStorage).toHaveBeenCalledWith(defaultStorage);
  });
});
