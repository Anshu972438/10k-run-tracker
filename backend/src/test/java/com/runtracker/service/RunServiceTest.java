package com.runtracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.runtracker.dto.CreateRunRequest;
import com.runtracker.dto.RunResponse;
import com.runtracker.dto.RunSummaryResponse;
import com.runtracker.entity.Run;
import com.runtracker.exception.RunNotFoundException;
import com.runtracker.repository.RunRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RunServiceTest {

    @Mock
    private RunRepository runRepository;

    @Mock
    private DistanceCalculator distanceCalculator;

    @InjectMocks
    private RunService runService;

    @Test
    void createRunCalculatesDistanceAndSavesRun() {
        CreateRunRequest request = new CreateRunRequest(
                "Big Ben", 51.5007, -0.1246, "Tower Bridge", 51.5055, -0.0754, LocalDate.of(2026, 9, 28), 1200);
        when(distanceCalculator.distanceKm(51.5007, -0.1246, 51.5055, -0.0754)).thenReturn(3.45);
        when(runRepository.save(any(Run.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RunResponse response = runService.createRun(request);

        ArgumentCaptor<Run> savedRun = ArgumentCaptor.forClass(Run.class);
        verify(runRepository).save(savedRun.capture());
        assertThat(savedRun.getValue().getStartLocation()).isEqualTo("Big Ben");
        assertThat(savedRun.getValue().getDistanceKm()).isEqualTo(3.45);
        assertThat(response.distanceKm()).isEqualTo(3.45);
        assertThat(response.runDate()).isEqualTo(LocalDate.of(2026, 9, 28));
        assertThat(response.durationSeconds()).isEqualTo(1200);
        // 1200 s / 3.45 km = 347.8 s per km, rounded to 348 (5:48 min/km)
        assertThat(response.paceSecondsPerKm()).isEqualTo(348);
    }

    @Test
    void createRunWithoutDurationHasNoPace() {
        CreateRunRequest request = new CreateRunRequest(
                "Big Ben", 51.5007, -0.1246, "Tower Bridge", 51.5055, -0.0754, null, null);
        when(runRepository.save(any(Run.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RunResponse response = runService.createRun(request);

        assertThat(response.durationSeconds()).isNull();
        assertThat(response.paceSecondsPerKm()).isNull();
    }

    @Test
    void createRunUsesTodayWhenDateIsMissing() {
        CreateRunRequest request = new CreateRunRequest(
                "Big Ben", 51.5007, -0.1246, "Tower Bridge", 51.5055, -0.0754, null, null);
        when(runRepository.save(any(Run.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RunResponse response = runService.createRun(request);

        assertThat(response.runDate()).isEqualTo(LocalDate.now());
    }

    @Test
    void getRunsReturnsRunsInRepositoryOrder() {
        Run newer = new Run("Amsterdam Centraal", 52.3791, 4.9003, "Vondelpark", 52.3580, 4.8686,
                3.18, LocalDate.of(2026, 9, 30), null);
        Run older = new Run("Big Ben", 51.5007, -0.1246, "Tower Bridge", 51.5055, -0.0754,
                3.45, LocalDate.of(2026, 9, 28), null);
        when(runRepository.findAllByOrderByRunDateDescCreatedAtDesc()).thenReturn(List.of(newer, older));

        List<RunResponse> runs = runService.getRuns();

        assertThat(runs).extracting(RunResponse::startLocation)
                .containsExactly("Amsterdam Centraal", "Big Ben");
    }

    @Test
    void getSummaryReturnsCountAndRoundedTotal() {
        when(runRepository.count()).thenReturn(2L);
        when(runRepository.sumDistanceKm()).thenReturn(6.630000000000001);

        RunSummaryResponse summary = runService.getSummary();

        assertThat(summary.totalRuns()).isEqualTo(2);
        assertThat(summary.totalDistanceKm()).isEqualTo(6.63);
    }

    @Test
    void getSummaryReturnsZeroWhenThereAreNoRuns() {
        when(runRepository.count()).thenReturn(0L);
        when(runRepository.sumDistanceKm()).thenReturn(0.0);

        RunSummaryResponse summary = runService.getSummary();

        assertThat(summary.totalRuns()).isZero();
        assertThat(summary.totalDistanceKm()).isZero();
    }

    @Test
    void deleteRunDeletesExistingRun() {
        when(runRepository.existsById(1L)).thenReturn(true);

        runService.deleteRun(1L);

        verify(runRepository).deleteById(1L);
    }

    @Test
    void deleteRunThrowsWhenRunDoesNotExist() {
        when(runRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> runService.deleteRun(99L))
                .isInstanceOf(RunNotFoundException.class)
                .hasMessage("Run with id 99 not found");
        verify(runRepository, never()).deleteById(any());
    }
}
