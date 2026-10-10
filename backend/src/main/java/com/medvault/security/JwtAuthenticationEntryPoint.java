package com.medvault.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Distinguishes "no credentials presented" (401) from "credentials presented but
 * rejected" (403 — e.g. a deactivated account whose JWT no longer authenticates).
 *
 * <p>The 403 case stays body-less so the frontend dead-session handling
 * ({@code auth:forbidden}) keeps working; domain denials still carry an
 * {@code ErrorResponse} message via the service layer and never trigger logout.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        if (request.getHeader("Authorization") != null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String path = request.getRequestURI().replace("\"", "");
        response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\","
                + "\"message\":\"Authentication required\",\"path\":\"" + path + "\"}");
    }
}
