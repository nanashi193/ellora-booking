package com.bookingnailms.service;

import com.bookingnailms.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.Map;

/**
 * Service xử lý các thao tác xác thực với AWS Cognito.
 * <p>
 * Để SDK tự động tìm credentials, cấu hình một trong các cách sau:
 * <ul>
 *   <li>Biến môi trường: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION</li>
 *   <li>File ~/.aws/credentials</li>
 *   <li>IAM Role (nếu chạy trên EC2 / ECS / Lambda)</li>
 * </ul>
 */
@Slf4j
@Service
public class CognitoService {

    private final CognitoIdentityProviderClient cognitoClient;
    private final String userPoolId;
    private final String clientId;

    public CognitoService(
            @Value("${app.cognito.region:ap-southeast-2}") String region,
            @Value("${app.cognito.user-pool-id}") String userPoolId,
            @Value("${app.cognito.client-id}") String clientId) {

        this.userPoolId = userPoolId;
        this.clientId = clientId;
        this.cognitoClient = CognitoIdentityProviderClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Forgot Password – bước 1: gửi OTP về email người dùng
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Kích hoạt luồng quên mật khẩu Cognito.
     * Cognito sẽ gửi mã OTP về email đã đăng ký của người dùng.
     *
     * @param email địa chỉ email đã đăng ký tài khoản
     */
    public void forgotPassword(String email) {
        try {
            ForgotPasswordRequest request = ForgotPasswordRequest.builder()
                    .clientId(clientId)
                    .username(email)
                    .build();

            cognitoClient.forgotPassword(request);
            log.info("Forgot password initiated for email: {}", email);

        } catch (UserNotFoundException e) {
            // Không tiết lộ email có tồn tại hay không (bảo mật)
            log.warn("Forgot password requested for non-existent user: {}", email);

        } catch (LimitExceededException e) {
            throw new BadRequestException("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.");

        } catch (InvalidParameterException e) {
            throw new BadRequestException("Email chưa được xác minh. Vui lòng xác minh email trước.");

        } catch (CognitoIdentityProviderException e) {
            log.error("Cognito error during forgotPassword: {}", e.awsErrorDetails().errorMessage());
            throw new BadRequestException("Không thể gửi mã xác nhận. Vui lòng thử lại.");
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Confirm Forgot Password – bước 2: xác nhận OTP và đặt mật khẩu mới
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Xác nhận mã OTP và đặt mật khẩu mới.
     *
     * @param email            địa chỉ email
     * @param confirmationCode mã OTP nhận được qua email
     * @param newPassword      mật khẩu mới
     */
    public void confirmForgotPassword(String email, String confirmationCode, String newPassword) {
        try {
            ConfirmForgotPasswordRequest request = ConfirmForgotPasswordRequest.builder()
                    .clientId(clientId)
                    .username(email)
                    .confirmationCode(confirmationCode)
                    .password(newPassword)
                    .build();

            cognitoClient.confirmForgotPassword(request);
            log.info("Password reset confirmed for email: {}", email);

        } catch (CodeMismatchException e) {
            throw new BadRequestException("Mã xác nhận không đúng. Vui lòng kiểm tra lại.");

        } catch (ExpiredCodeException e) {
            throw new BadRequestException("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.");

        } catch (UserNotFoundException e) {
            throw new BadRequestException("Không tìm thấy tài khoản với email này.");

        } catch (InvalidPasswordException e) {
            throw new BadRequestException("Mật khẩu không đáp ứng yêu cầu. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

        } catch (LimitExceededException e) {
            throw new BadRequestException("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.");

        } catch (CognitoIdentityProviderException e) {
            log.error("Cognito error during confirmForgotPassword: {}", e.awsErrorDetails().errorMessage());
            throw new BadRequestException("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Change Password – đổi mật khẩu khi đã đăng nhập (dùng access token)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Đổi mật khẩu cho người dùng đang đăng nhập.
     *
     * @param accessToken   Cognito access token của người dùng hiện tại
     * @param currentPassword mật khẩu hiện tại
     * @param newPassword     mật khẩu mới
     */
    public void changePassword(String accessToken, String currentPassword, String newPassword) {
        try {
            ChangePasswordRequest request = ChangePasswordRequest.builder()
                    .accessToken(accessToken)
                    .previousPassword(currentPassword)
                    .proposedPassword(newPassword)
                    .build();

            cognitoClient.changePassword(request);
            log.info("Password changed successfully");

        } catch (NotAuthorizedException e) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng.");

        } catch (InvalidPasswordException e) {
            throw new BadRequestException("Mật khẩu mới không đáp ứng yêu cầu. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");

        } catch (LimitExceededException e) {
            throw new BadRequestException("Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.");

        } catch (CognitoIdentityProviderException e) {
            log.error("Cognito error during changePassword: {}", e.awsErrorDetails().errorMessage());
            throw new BadRequestException("Không thể đổi mật khẩu. Vui lòng thử lại.");
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Login – đăng nhập bằng email/password trả về tokens
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Đăng nhập người dùng và trả về access/id/refresh tokens.
     *
     * @param email    email người dùng
     * @param password mật khẩu
     * @return {@link AuthenticationResultType} chứa access, id và refresh token
     */
    public AuthenticationResultType login(String email, String password) {
        try {
            InitiateAuthRequest request = InitiateAuthRequest.builder()
                    .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                    .clientId(clientId)
                    .authParameters(Map.of(
                            "USERNAME", email,
                            "PASSWORD", password
                    ))
                    .build();

            InitiateAuthResponse response = cognitoClient.initiateAuth(request);
            return response.authenticationResult();

        } catch (NotAuthorizedException | UserNotFoundException e) {
            throw new BadRequestException("Email hoặc mật khẩu không chính xác.");

        } catch (UserNotConfirmedException e) {
            throw new BadRequestException("Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản.");

        } catch (CognitoIdentityProviderException e) {
            log.error("Cognito error during login: {}", e.awsErrorDetails().errorMessage());
            throw new BadRequestException("Đăng nhập thất bại. Vui lòng thử lại.");
        }
    }
}
