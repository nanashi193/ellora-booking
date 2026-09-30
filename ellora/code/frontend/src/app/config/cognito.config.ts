import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { defaultStorage, sessionStorage as amplifySessionStorage } from 'aws-amplify/utils';

const storagePreferenceKey = 'ellora-auth-storage';

export function selectAuthStorage(remember: boolean): void {
  if (typeof window !== 'undefined') {
    try { window.sessionStorage.setItem(storagePreferenceKey, remember ? 'local' : 'session'); }
    catch { /* Browser storage may be unavailable; Amplify handles its storage fallback. */ }
  }
  cognitoUserPoolsTokenProvider.setKeyValueStorage(remember ? defaultStorage : amplifySessionStorage);
}

export function restoreAuthStorage(): void {
  if (typeof window === 'undefined') return;
  let useSession = false;
  try {
    const preference = window.sessionStorage.getItem(storagePreferenceKey);
    // Recover sessions created before the storage preference was saved.
    useSession = preference === 'session' || (preference === null &&
      window.sessionStorage.getItem(`CognitoIdentityServiceProvider.${cognitoConfig.userPoolClientId}.LastAuthUser`) !== null);
  } catch { /* Keep Amplify's default when browser storage cannot be read. */ }
  cognitoUserPoolsTokenProvider.setKeyValueStorage(useSession ? amplifySessionStorage : defaultStorage);
}

export const cognitoConfig = {
  region: 'ap-southeast-2',
  userPoolId: 'ap-southeast-2_iUMERg77o',
  userPoolClientId: '10ivodmqmsklu4gqkqj1qcgr0h',
  oauthDomain: 'ap-southeast-2iumerg77o.auth.ap-southeast-2.amazoncognito.com',
};

export function isCognitoConfigured(): boolean {
  return ![
    cognitoConfig.region,
    cognitoConfig.userPoolId,
    cognitoConfig.userPoolClientId,
  ].some((value) => value.startsWith('YOUR_'));
}

export function isGoogleSignInConfigured(): boolean {
  return isCognitoConfigured() && !cognitoConfig.oauthDomain.startsWith('YOUR_');
}

export function configureCognito(): void {
  if (!isCognitoConfigured()) {
    return;
  }

  const origin = typeof window === 'undefined' ? 'http://localhost:4200' : window.location.origin;
  const oauth = isGoogleSignInConfigured()
    ? {
        domain: cognitoConfig.oauthDomain,
        scopes: ['openid', 'email', 'profile'],
        redirectSignIn: [`${origin}/login`],
        redirectSignOut: [`${origin}/login`],
        responseType: 'code' as const,
        providers: ['Google' as const],
      }
    : undefined;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: cognitoConfig.userPoolId,
        userPoolClientId: cognitoConfig.userPoolClientId,
        loginWith: {
          email: true,
          ...(oauth ? { oauth } : {}),
        },
      },
    },
  });
  // Amplify.configure resets the token provider to defaultStorage.
  restoreAuthStorage();
}
