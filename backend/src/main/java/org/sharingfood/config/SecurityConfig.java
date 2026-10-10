package org.sharingfood.config;

import jakarta.servlet.http.HttpServletResponse;
import org.sharingfood.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Unauthorized Supplier: Access denied. Insufficient permissions.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/volunteer/validate/**").permitAll()
                .requestMatchers("/api/uploads/**").permitAll()
                // Public organization directory & public read routes
                .requestMatchers("/api/organizations/directory/suppliers").authenticated()
                .requestMatchers("/api/organizations/directory/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // Require auth for nearby donations
                .requestMatchers("/api/donations/nearby").authenticated()
                // Strict App Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "http://192.168.*:*",
            "http://10.*:*",
            "http://172.*:*",
            "https://*.loca.lt",
            "https://*.ngrok-free.app",
            "https://*.trycloudflare.com",
            "https://*.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie", "Set-Cookie"));
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
