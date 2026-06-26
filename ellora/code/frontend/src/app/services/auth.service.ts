import { Injectable } from '@angular/core';
import {
  confirmSignUp,
  confirmResetPassword,
  fetchAuthSession,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { defaultStorage, sessionStorage } from 'aws-amplify/utils';
import {
  isCognitoConfigured,
  isGoogleSignInConfigured,
} from '../config/cognito.config';
import {
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly requestTimeoutMs = 20_000;

  async login(credentials: LoginRequest): Promise<LoginResult> {
    if (!isCognitoConfigured()) {
      return this.configurationError();
    }

    try {
      cognitoUserPoolsTokenProvider.setKeyValueStorage(
        credentials.remember ? defaultStorage : sessionStorage,
      );

      if (await this.isAuthenticated()) {
        return { success: true };
      }

      const result = await this.withTimeout(
        signIn({
          username: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }),
      );

      if (result.isSignedIn) {
        return { success: true };
      }

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        return {
          success: false,
          requiresConfirmation: true,
          message: 'Tài khoản chưa xác nhận email.',
        };
      }

      return {
        success: false,
        message: 'Tài khoản cần hoàn thành thêm một bước xác thực.',
      };
    } catch (error) {
      return {
        success: false,
        requiresConfirmation: this.getErrorName(error) === 'UserNotConfirmedException',
        message: this.getErrorMessage(error),
      };
    }
  }

  async loginWithGoogle(): Promise<LoginResult> {
    if (!isGoogleSignInConfigured()) {
      return {
        success: false,
        message: 'Đăng nhập Google chưa được cấu hình Cognito domain.',
      };
    }

    try {
      await signInWithRedirect({ provider: 'Google' });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  async register(request: RegisterRequest): Promise<RegisterResult> {
    if (!isCognitoConfigured()) {
      return {
        ...this.configurationError(),
        requiresConfirmation: false,
      };
    }

    try {
      const result = await this.withTimeout(
        signUp({
          username: request.email.trim().toLowerCase(),
          password: request.password,
          options: {
            userAttributes: {
              email: request.email.trim().toLowerCase(),
              name: request.fullName.trim(),
              phone_number: request.phone,
            },
          },
        }),
      );

      return {
        success: result.isSignUpComplete,
        requiresConfirmation: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP',
      };
    } catch (error) {
      return {
        success: false,
        requiresConfirmation: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  async confirmRegistration(email: string, code: string): Promise<RegisterResult> {
    try {
      const result = await this.withTimeout(
        confirmSignUp({
          username: email.trim().toLowerCase(),
          confirmationCode: code.trim(),
        }),
      );

      return {
        success: result.isSignUpComplete,
        requiresConfirmation: !result.isSignUpComplete,
      };
    } catch (error) {
      return {
        success: false,
        requiresConfirmation: true,
        message: this.getErrorMessage(error),
      };
    }
  }

  async resendConfirmationCode(email: string): Promise<LoginResult> {
    if (!isCognitoConfigured()) {
      return this.configurationError();
    }

    try {
      const result = await this.withTimeout(
        resendSignUpCode({
          username: email.trim().toLowerCase(),
        }),
      );

      const destination = result.destination;
      return {
        success: true,
        message: destination
          ? `Đã gửi mã mới tới ${destination}. Vui lòng kiểm tra hộp thư và thư rác.`
          : 'Đã gửi lại mã xác nhận. Vui lòng kiểm tra email và thư rác.',
      };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  async requestPasswordReset(email: string): Promise<LoginResult> {
    if (!isCognitoConfigured()) {
      return this.configurationError();
    }

    try {
      const result = await this.withTimeout(
        resetPassword({
          username: email.trim().toLowerCase(),
        }),
      );

      if (result.nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        return {
          success: true,
          message: 'Mã đặt lại mật khẩu đã được gửi tới email của bạn.',
        };
      }

      return {
        success: false,
        message: 'Không thể bắt đầu đặt lại mật khẩu.',
      };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  async confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<LoginResult> {
    if (!isCognitoConfigured()) {
      return this.configurationError();
    }

    try {
      await this.withTimeout(
        confirmResetPassword({
          username: email.trim().toLowerCase(),
          confirmationCode: code.trim(),
          newPassword,
        }),
      );

      return {
        success: true,
        message: 'Mật khẩu đã được cập nhật.',
      };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!isCognitoConfigured()) {
      return null;
    }

    const session = await fetchAuthSession();
    return session.tokens?.accessToken.toString() ?? null;
  }

  async isAuthenticated(): Promise<boolean> {
    if (!isCognitoConfigured()) {
      return false;
    }

    try {
      const session = await fetchAuthSession();
      return Boolean(session.tokens?.accessToken);
    } catch {
      return false;
    }
  }

  async getUserProfile(): Promise<{ email: string; name: string; phone_number?: string }> {
    const attributes = await fetchUserAttributes();
    return {
      email: attributes.email ?? '',
      name: attributes.name ?? attributes.email ?? '',
      phone_number: attributes.phone_number
    };
  }

  async logout(): Promise<void> {
    if (isCognitoConfigured()) {
      await signOut();
    }
  }

  private configurationError(): LoginResult {
    return {
      success: false,
      message: 'Cognito chưa được cấu hình cho ứng dụng.',
    };
  }

  private getErrorName(error: unknown): string {
    return error instanceof Error ? error.name : '';
  }

  private getErrorMessage(error: unknown): string {
    const errorName = this.getErrorName(error);
    const rawMessage = error instanceof Error ? error.message.toLowerCase() : '';

    if (
      errorName === 'InvalidParameterException' &&
      (rawMessage.includes('verified') || rawMessage.includes('delivery'))
    ) {
      return 'Email của tài khoản chưa được xác minh nên Cognito không thể gửi mã đặt lại mật khẩu.';
    }

    const messages: Record<string, string> = {
      CodeMismatchException: 'Mã xác nhận không đúng.',
      CodeDeliveryFailureException: 'AWS chưa gửi được email xác nhận. Vui lòng kiểm tra cấu hình SES của Cognito.',
      ExpiredCodeException: 'Mã xác nhận đã hết hạn.',
      InvalidPasswordException: 'Mật khẩu chưa đáp ứng chính sách bảo mật.',
      InvalidParameterException: 'Thông tin tài khoản chưa hợp lệ để đặt lại mật khẩu.',
      PasswordResetRequiredException: 'Tài khoản cần đặt lại mật khẩu.',
      LimitExceededException: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
      NetworkError: 'Không thể kết nối AWS Cognito. Vui lòng kiểm tra mạng.',
      NotAuthorizedException: 'Email hoặc mật khẩu không đúng.',
      TooManyRequestsException: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
      UserAlreadyAuthenticatedException: 'Bạn đã đăng nhập.',
      UserLambdaValidationException: 'Cognito đã từ chối gửi mã. Vui lòng kiểm tra cấu hình gửi email.',
      UsernameExistsException: 'Email này đã được đăng ký.',
      UserNotConfirmedException: 'Tài khoản chưa xác nhận email.',
      UserNotFoundException: 'Email hoặc mật khẩu không đúng.',
    };

    return messages[errorName] ?? 'Không thể xác thực với AWS Cognito. Vui lòng thử lại.';
  }

  private async withTimeout<T>(request: Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error('AWS Cognito request timed out');
        error.name = 'NetworkError';
        reject(error);
      }, this.requestTimeoutMs);
    });

    try {
      return await Promise.race([request, timeout]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
