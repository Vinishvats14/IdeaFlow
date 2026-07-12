package com.vinu.cms.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // generaly session m store hoti h
                // information us user ki pr jwt stateless h to isko disable krna padega kyuki authentication ab username s nhi token s hoga so no user information stored
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)   //Agar koi user bina login kiye
                        // kisi private API ko access karne ki koshish karega, toh yeh component use 401 Unauthorized error return karega.

                        .accessDeniedHandler(jwtAccessDeniedHandler)) //Agar user logged in hai
                // (jaise koi AUTHOR), lekin wo ADMIN wali API chalane ki koshish kar raha hai, toh yeh use 403 Forbidden error return karega.

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/error",
                                "/api/public/**"
                                ).permitAll()

                        .anyRequest()
                        .authenticated()
                )
                .authenticationProvider(authenticationProvider(
                        userDetailsService,
                        passwordEncoder
                ))
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();

    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();

    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
//Jab Spring Security dekhta hai ki aapne apne project me ek DaoAuthenticationProvider ka bean banaya hai, toh wo use uthata hai aur AuthenticationManager (Sabka Boss) ke andar daal deta hai.
//Ab jab bhi login request aayegi:
//AuthenticationManager request pakdega.
//Wo request is DaoAuthenticationProvider ko de dega.
//Yeh provider aapke CustomUserDetailsService se user nikalega aur PasswordEncoder se password check karega.
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;

    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.List.of(
                "http://localhost:5173",
                "http://localhost:4173",
                "http://localhost:3000",
                "https://*.vercel.app"
        ));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Cache-Control", "Accept"));
        configuration.setExposedHeaders(java.util.List.of("Authorization"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}