package com.bookingnailms.service;

import com.bookingnailms.dto.auth.AuthResponse;
import com.bookingnailms.dto.auth.LoginRequest;
import com.bookingnailms.dto.auth.RefreshTokenRequest;
import com.bookingnailms.dto.auth.RegisterRequest;
import com.bookingnailms.entity.User;
import com.bookingnailms.exception.BadRequestException;
import com.bookingnailms.repository.UserRepository;
import com.bookingnailms.security.CustomUserDetails;
import com.bookingnailms.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        userRepository.save(user);

        // Auto authenticate after registration
        return login(new LoginRequest(request.getEmail(), request.getPassword()));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String token = tokenProvider.generateToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(userDetails.getRole().name())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getUserEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("Token không hợp lệ"));

            CustomUserDetails userDetails = new CustomUserDetails(user);
            String newToken = tokenProvider.generateToken(userDetails);
            String newRefreshToken = tokenProvider.generateRefreshToken(userDetails);

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .id(userDetails.getId())
                    .email(userDetails.getEmail())
                    .fullName(userDetails.getFullName())
                    .role(userDetails.getRole().name())
                    .build();
        }
        throw new BadRequestException("Refresh token không hợp lệ hoặc đã hết hạn");
    }
}
