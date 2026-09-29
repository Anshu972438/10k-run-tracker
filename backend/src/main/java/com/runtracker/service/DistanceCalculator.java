package com.runtracker.service;

import org.springframework.stereotype.Component;

@Component
public class DistanceCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    // Haversine formula: the shortest distance between two points on a sphere,
    // using their latitude and longitude. It ignores roads and paths.
    public double distanceKm(double startLatitude, double startLongitude,
                             double endLatitude, double endLongitude) {
        double latitudeDifference = Math.toRadians(endLatitude - startLatitude);
        double longitudeDifference = Math.toRadians(endLongitude - startLongitude);

        double a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2)
                + Math.cos(Math.toRadians(startLatitude)) * Math.cos(Math.toRadians(endLatitude))
                * Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);
        double centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(EARTH_RADIUS_KM * centralAngle * 100) / 100.0;
    }
}
