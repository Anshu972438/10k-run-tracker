package com.runtracker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "runs")
public class Run {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String startLocation;

    private double startLatitude;

    private double startLongitude;

    @Column(nullable = false)
    private String endLocation;

    private double endLatitude;

    private double endLongitude;

    private double distanceKm;

    @Column(nullable = false)
    private LocalDate runDate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Run() {
    }

    public Run(String startLocation, double startLatitude, double startLongitude,
               String endLocation, double endLatitude, double endLongitude,
               double distanceKm, LocalDate runDate) {
        this.startLocation = startLocation;
        this.startLatitude = startLatitude;
        this.startLongitude = startLongitude;
        this.endLocation = endLocation;
        this.endLatitude = endLatitude;
        this.endLongitude = endLongitude;
        this.distanceKm = distanceKm;
        this.runDate = runDate;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getStartLocation() {
        return startLocation;
    }

    public double getStartLatitude() {
        return startLatitude;
    }

    public double getStartLongitude() {
        return startLongitude;
    }

    public String getEndLocation() {
        return endLocation;
    }

    public double getEndLatitude() {
        return endLatitude;
    }

    public double getEndLongitude() {
        return endLongitude;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public LocalDate getRunDate() {
        return runDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
