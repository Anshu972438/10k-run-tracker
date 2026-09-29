package com.runtracker.dto;

import com.runtracker.entity.Run;
import java.time.LocalDate;

public record RunResponse(
        Long id,
        String startLocation,
        double startLatitude,
        double startLongitude,
        String endLocation,
        double endLatitude,
        double endLongitude,
        double distanceKm,
        LocalDate runDate
) {

    public static RunResponse from(Run run) {
        return new RunResponse(
                run.getId(),
                run.getStartLocation(),
                run.getStartLatitude(),
                run.getStartLongitude(),
                run.getEndLocation(),
                run.getEndLatitude(),
                run.getEndLongitude(),
                run.getDistanceKm(),
                run.getRunDate()
        );
    }
}
