package com.medvault.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.medvault.model.ReportGenerationLog;

@Repository
public interface ReportGenerationLogRepository extends JpaRepository<ReportGenerationLog, UUID> {

        // Find the latest report generation log (any type)
        ReportGenerationLog findTopByOrderByGeneratedAtDesc();
    List<ReportGenerationLog> findByReportTypeOrderByGeneratedAtDesc(String reportType);

    @Query("SELECT COUNT(r) FROM ReportGenerationLog r WHERE r.reportType = :reportType")
    long countByReportType(String reportType);

    @Query("SELECT r FROM ReportGenerationLog r WHERE r.reportType = :reportType ORDER BY r.generatedAt DESC LIMIT 1")
    Optional<ReportGenerationLog> findTopByReportTypeOrderByGeneratedAtDesc(String reportType);
}
