import { Amplify } from 'aws-amplify';

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
}
