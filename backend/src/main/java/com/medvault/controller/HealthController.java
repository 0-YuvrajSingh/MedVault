package com.medvault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        status.put("uptimeMs", uptimeMs);

        boolean databaseConnected = false;
        try (Connection conn = dataSource.getConnection()) {
            databaseConnected = conn.isValid(2);
        } catch (Exception ignored) {
            // The response below accurately reports a degraded dependency.
        }
        status.put("database", databaseConnected ? "Connected" : "Disconnected");
        status.put("apiStatus", databaseConnected ? "Operational" : "Degraded");

        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        status.put("cpuCores", osBean.getAvailableProcessors());
        long totalMemory = Runtime.getRuntime().totalMemory();
        long freeMemory = Runtime.getRuntime().freeMemory();
        status.put("usedMemoryMB", (totalMemory - freeMemory) / (1024 * 1024));
        status.put("totalMemoryMB", totalMemory / (1024 * 1024));
        status.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(status);
    }
}
