package com.medvault.dto;

public class DashboardSummaryDTO {
    private long patients;
    private long doctors;
    private long appointments;
    private long reviews;
    private long documents;
    private long files;
    private long feedback;
    private long upcomingAppointments7d;
    private long pendingAppointments;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(long patients, long doctors, long appointments, long reviews, long documents, long files, long feedback, long upcomingAppointments7d, long pendingAppointments) {
        this.patients = patients;
        this.doctors = doctors;
        this.appointments = appointments;
        this.reviews = reviews;
        this.documents = documents;
        this.files = files;
        this.feedback = feedback;
        this.upcomingAppointments7d = upcomingAppointments7d;
        this.pendingAppointments = pendingAppointments;
    }

    public long getPatients() { return patients; }
    public long getDoctors() { return doctors; }
    public long getAppointments() { return appointments; }
    public long getReviews() { return reviews; }
    public long getDocuments() { return documents; }
    public long getFiles() { return files; }
    public long getFeedback() { return feedback; }
    public long getUpcomingAppointments7d() { return upcomingAppointments7d; }
    public long getPendingAppointments() { return pendingAppointments; }
}
