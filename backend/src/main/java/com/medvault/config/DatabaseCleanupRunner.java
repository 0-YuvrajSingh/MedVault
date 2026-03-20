package com.medvault.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseCleanupRunner {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void cleanOrphanedAppointments() {
        try {
            String sql = "DELETE FROM appointments WHERE slot_id IS NOT NULL AND slot_id NOT IN (SELECT id FROM slots)";
            int affected = jdbcTemplate.update(sql);
            if (affected > 0) {
                log.info("Database cleanup: Removed {} orphaned appointments", affected);
            } else {
                log.debug("Database cleanup: No orphaned appointments found");
            }
        } catch (org.springframework.dao.DataAccessException dae) {
            log.error("Database cleanup failed: {}", dae.getMessage());
        }
    }
}
