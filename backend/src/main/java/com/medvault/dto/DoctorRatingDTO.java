package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DoctorRatingDTO {

    private String doctorId;
    private String doctorName;
    private String specialization;
    private Double averageRating;
    private Long totalReviews;
}
