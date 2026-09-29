package com.runtracker.service;

import com.runtracker.dto.CreateRunRequest;
import com.runtracker.dto.RunResponse;
import com.runtracker.dto.RunSummaryResponse;
import com.runtracker.entity.Run;
import com.runtracker.repository.RunRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RunService {

    private final RunRepository runRepository;
    private final DistanceCalculator distanceCalculator;

    public RunService(RunRepository runRepository, DistanceCalculator distanceCalculator) {
        this.runRepository = runRepository;
        this.distanceCalculator = distanceCalculator;
    }

    public RunResponse createRun(CreateRunRequest request) {
        double distanceKm = distanceCalculator.distanceKm(
                request.startLatitude(), request.startLongitude(),
                request.endLatitude(), request.endLongitude());
        LocalDate runDate = request.runDate() != null ? request.runDate() : LocalDate.now();

        Run run = new Run(
                request.startLocation(), request.startLatitude(), request.startLongitude(),
                request.endLocation(), request.endLatitude(), request.endLongitude(),
                distanceKm, runDate);

        return RunResponse.from(runRepository.save(run));
    }

    public List<RunResponse> getRuns() {
        return runRepository.findAllByOrderByRunDateDescCreatedAtDesc().stream()
                .map(RunResponse::from)
                .toList();
    }

    public RunSummaryResponse getSummary() {
        // Adding doubles can leave tiny errors (6.630000000000001), so round the total again.
        double totalDistanceKm = Math.round(runRepository.sumDistanceKm() * 100) / 100.0;
        return new RunSummaryResponse(runRepository.count(), totalDistanceKm);
    }
}
