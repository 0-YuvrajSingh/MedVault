package com.medvault.dto;

import java.util.Map;
import java.util.UUID;

public class AppointmentSeriesDTO {
    private int range;
    private UUID doctorId;
    private UUID patientId;
    private Map<String, Long> series;

    public AppointmentSeriesDTO() {}

    public AppointmentSeriesDTO(int range, UUID doctorId, UUID patientId, Map<String, Long> series) {
        this.range = range;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.series = series;
    }

    public int getRange() { return range; }
    public UUID getDoctorId() { return doctorId; }
    public UUID getPatientId() { return patientId; }
    public Map<String, Long> getSeries() { return series; }
}
