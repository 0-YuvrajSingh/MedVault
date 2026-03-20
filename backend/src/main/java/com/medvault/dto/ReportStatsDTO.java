package com.medvault.dto;
import java.time.LocalDateTime;

public class ReportStatsDTO {
    private long reportsGenerated;
    private LocalDateTime lastGenerated;

    public ReportStatsDTO(long reportsGenerated, LocalDateTime lastGenerated) {
        this.reportsGenerated = reportsGenerated;
        this.lastGenerated = lastGenerated;
    }
    public long getReportsGenerated() { return reportsGenerated; }
    public void setReportsGenerated(long reportsGenerated) { this.reportsGenerated = reportsGenerated; }
    public LocalDateTime getLastGenerated() { return lastGenerated; }
    public void setLastGenerated(LocalDateTime lastGenerated) { this.lastGenerated = lastGenerated; }
}
