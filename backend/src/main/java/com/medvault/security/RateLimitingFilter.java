package com.medvault.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final class BucketEntry {
        final Bucket bucket;
        volatile long lastAccessNanos;

        BucketEntry(Bucket bucket, long now) {
            this.bucket = bucket;
            this.lastAccessNanos = now;
        }
    }

    private final Map<String, BucketEntry> buckets = new ConcurrentHashMap<>();

    @Value("${rate-limiting.login.max-requests-per-minute:5}")
    private int maxRequestsPerMinute;

    /**
     * Only honor X-Forwarded-For when explicitly configured (i.e. the app is behind a
     * trusted proxy that strips/spoofs client headers). By default the client IP is
     * {@code request.getRemoteAddr()}, which a client cannot forge.
     */
    @Value("${rate-limiting.trust-forwarded-headers:false}")
    private boolean trustForwardedHeaders;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!isRateLimitedEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = rateLimitKey(request);
        long now = System.nanoTime();
        BucketEntry entry = buckets.computeIfAbsent(key, k -> new BucketEntry(createBucket(), now));
        entry.lastAccessNanos = now;

        if (entry.bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"message\":\"Too many login attempts. Please try again later.\"}"
            );
        }
    }

    private boolean isRateLimitedEndpoint(HttpServletRequest request) {
        String uri = request.getRequestURI();
        boolean post = "POST".equalsIgnoreCase(request.getMethod());
        return post && ("/api/auth/login".equals(uri) || "/api/auth/register".equals(uri));
    }

    private String rateLimitKey(HttpServletRequest request) {
        return request.getRequestURI() + "|" + resolveClientIp(request);
    }

    private Bucket createBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.simple(maxRequestsPerMinute, Duration.ofMinutes(1)))
                .build();
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (trustForwardedHeaders) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    /**
     * Evict buckets idle for over ~70 minutes so the in-memory map cannot grow
     * without Lid from rotating client identities. Runs every 10 minutes.
     */
    @Scheduled(fixedDelay = 600_000)
    void evictIdleBuckets() {
        long cutoff = System.nanoTime() - Duration.ofMinutes(70).toNanos();
        buckets.entrySet().removeIf(e -> e.getValue().lastAccessNanos < cutoff);
    }
}
