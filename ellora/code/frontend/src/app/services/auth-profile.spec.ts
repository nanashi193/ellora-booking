import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('aws-amplify/auth', () => ({
  fetchAuthSession: vi.fn(), fetchUserAttributes: vi.fn(),
  confirmSignUp: vi.fn(), confirmResetPassword: vi.fn(), resendSignUpCode: vi.fn(), resetPassword: vi.fn(),
  signIn: vi.fn(), signInWithRedirect: vi.fn(), signOut: vi.fn(), signUp: vi.fn(), updatePassword: vi.fn(),
}));
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { AuthService } from './auth.service';

describe('OAuth profile', () => {
  beforeEach(() => vi.resetAllMocks());
  it('reads Google profile from ID token without calling scope-restricted GetUser', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: {
      accessToken: { payload: { scope: 'openid email profile' } },
      idToken: { payload: { email: 'demo@example.com', name: 'Demo' } },
    } } as any);
    expect(await new AuthService().getUserProfile()).toEqual({ email: 'demo@example.com', name: 'Demo', phone_number: undefined });
    expect(fetchUserAttributes).not.toHaveBeenCalled();
  });
  it('keeps direct Cognito profile reads for password-based sessions with the required scope', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: { accessToken: { payload: { scope: 'aws.cognito.signin.user.admin' } } } } as any);
    vi.mocked(fetchUserAttributes).mockResolvedValue({ email: 'local@example.com', name: 'Local' });
    expect((await new AuthService().getUserProfile()).name).toBe('Local');
    expect(fetchUserAttributes).toHaveBeenCalledOnce();
  });
  it('rejects OAuth sessions without an email instead of syncing empty profile data', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: { accessToken: { payload: { scope: 'openid' } }, idToken: { payload: {} } } } as any);
    await expect(new AuthService().getUserProfile()).rejects.toThrow('email');
    expect(fetchUserAttributes).not.toHaveBeenCalled();
  });
});
