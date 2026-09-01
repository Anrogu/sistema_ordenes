package com.metalmod.tornos_produccion.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Permite pre-vuelo CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Reglas de negocio (El endpoint GET /api/tablero/datos ya está protegido por defecto)
                        .requestMatchers(HttpMethod.PUT, "/api/ordenes/*/prioridad").hasRole("VENTAS")
                        .requestMatchers(HttpMethod.POST, "/api/ordenes/upload-excel").hasRole("VENTAS")

                        // Todo lo demás bloqueado
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .successHandler((request, response, authentication) -> {
                            // Obtenemos el rol principal del usuario autenticado
                            String rol = authentication.getAuthorities().iterator().next().getAuthority();

                            response.setContentType("application/json");
                            response.setStatus(200);
                            // Devolvemos el rol en el JSON
                            response.getWriter().write("{\"status\": \"ok\", \"rol\": \"" + rol + "\"}");
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setContentType("application/json");
                            response.setStatus(401);
                            response.getWriter().write("{\"status\": \"error\", \"mensaje\": \"Credenciales incorrectas\"}");
                        })
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setContentType("application/json");
                            response.setStatus(200);
                            response.getWriter().write("{\"status\": \"ok\"}");
                        })
                        .permitAll()
                )
                .exceptionHandling(exc -> exc
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Si falla la autenticación, devuelve 401 en lugar de HTML
                            response.sendError(401, "No autorizado");
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedOrigins(List.of("http://192.168.1.173:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // ¡EL CAMBIO ESTÁ AQUÍ! Ahora el CORS cubre absolutamente todas las rutas
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}