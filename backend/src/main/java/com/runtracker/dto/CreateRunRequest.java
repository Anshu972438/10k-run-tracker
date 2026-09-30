package com.runtracker.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateRunRequest(
        @NotBlank @Size(max = 255) String startLocation,
        @NotNull @DecimalMin("-90") @DecimalMax("90") Double startLatitude,
        @NotNull @DecimalMin("-180") @DecimalMax("180") Double startLongitude,
        @NotBlank @Size(max = 255) String endLocation,
        @NotNull @DecimalMin("-90") @DecimalMax("90") Double endLatitude,
        @NotNull @DecimalMin("-180") @DecimalMax("180") Double endLongitude,
        LocalDate runDate,
        @Positive @Max(86400) Integer durationSeconds
) {
}
