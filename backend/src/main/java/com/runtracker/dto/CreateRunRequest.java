package com.runtracker.dto;

import java.time.LocalDate;

public record CreateRunRequest(
        String startLocation,
        Double startLatitude,
        Double startLongitude,
        String endLocation,
        Double endLatitude,
        Double endLongitude,
        LocalDate runDate
) {
}
