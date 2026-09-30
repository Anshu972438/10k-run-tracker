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
        LocalDate runDate,
        Integer durationSeconds,
        Integer paceSecondsPerKm
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
                run.getRunDate(),
                run.getDurationSeconds(),
                paceSecondsPerKm(run)
        );
    }

    // Pace is derived from the stored duration and distance, so it is never stored itself.
    private static Integer paceSecondsPerKm(Run run) {
        if (run.getDurationSeconds() == null || run.getDistanceKm() == 0) {
            return null;
        }
        return (int) Math.round(run.getDurationSeconds() / run.getDistanceKm());
    }
}
