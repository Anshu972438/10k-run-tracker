package com.runtracker.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class DistanceCalculatorTest {

    private final DistanceCalculator distanceCalculator = new DistanceCalculator();

    @Test
    void returnsZeroForTheSamePoint() {
        double distance = distanceCalculator.distanceKm(52.3791, 4.9003, 52.3791, 4.9003);

        assertThat(distance).isEqualTo(0.0);
    }

    @Test
    void oneDegreeOfLatitudeIsAbout111Km() {
        double distance = distanceCalculator.distanceKm(0, 0, 1, 0);

        assertThat(distance).isEqualTo(111.19);
    }

    @Test
    void calculatesDistanceBetweenBigBenAndTowerBridge() {
        double distance = distanceCalculator.distanceKm(51.5007, -0.1246, 51.5055, -0.0754);

        assertThat(distance).isEqualTo(3.45);
    }

    @Test
    void calculatesHalfTheEarthForOppositePoints() {
        // These points are exactly opposite each other; rounding used to turn the result into 0.
        double distance = distanceCalculator.distanceKm(-83, -179, 83, 1);

        assertThat(distance).isEqualTo(20015.09);
    }

    @Test
    void distanceIsTheSameInBothDirections() {
        double there = distanceCalculator.distanceKm(51.5007, -0.1246, 51.5055, -0.0754);
        double back = distanceCalculator.distanceKm(51.5055, -0.0754, 51.5007, -0.1246);

        assertThat(back).isEqualTo(there);
    }
}
