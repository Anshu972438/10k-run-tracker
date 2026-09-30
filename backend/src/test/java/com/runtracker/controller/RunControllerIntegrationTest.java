package com.runtracker.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.runtracker.entity.Run;
import com.runtracker.repository.RunRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RunControllerIntegrationTest {

    // Replaces the real clock so the default run date is predictable in tests.
    @TestConfiguration
    static class FixedClockConfig {

        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(Instant.parse("2026-09-15T08:00:00Z"), ZoneOffset.UTC);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RunRepository runRepository;

    @BeforeEach
    void clearDatabase() {
        runRepository.deleteAll();
    }

    @Test
    void createsRun() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754,
                  "runDate": "2026-09-28"
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.startLocation").value("Big Ben, London"))
                .andExpect(jsonPath("$.distanceKm").value(3.45))
                .andExpect(jsonPath("$.runDate").value("2026-09-28"));
    }

    @Test
    void createsRunWithTodayWhenDateIsMissing() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.runDate").value("2026-09-15"));
    }

    @Test
    void listsRunsNewestFirst() throws Exception {
        saveRun("Big Ben, London", 3.45, LocalDate.of(2026, 9, 28));
        saveRun("Amsterdam Centraal", 3.18, LocalDate.of(2026, 9, 30));

        mockMvc.perform(get("/api/runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].startLocation").value("Amsterdam Centraal"))
                .andExpect(jsonPath("$[1].startLocation").value("Big Ben, London"));
    }

    @Test
    void returnsSummaryOfAllRuns() throws Exception {
        saveRun("Big Ben, London", 3.45, LocalDate.of(2026, 9, 28));
        saveRun("Amsterdam Centraal", 3.18, LocalDate.of(2026, 9, 30));

        mockMvc.perform(get("/api/runs/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRuns").value(2))
                .andExpect(jsonPath("$.totalDistanceKm").value(6.63));
    }

    @Test
    void returnsEmptySummaryWhenThereAreNoRuns() throws Exception {
        mockMvc.perform(get("/api/runs/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRuns").value(0))
                .andExpect(jsonPath("$.totalDistanceKm").value(0.0));
    }

    @Test
    void rejectsInvalidRun() throws Exception {
        String request = """
                {
                  "startLocation": "",
                  "startLatitude": 95,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("startLocation must not be blank")))
                .andExpect(jsonPath("$.message").value(containsString("startLatitude must be less than or equal to 90")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void createsRunWithDurationAndReturnsPace() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754,
                  "durationSeconds": 1200
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.durationSeconds").value(1200))
                .andExpect(jsonPath("$.paceSecondsPerKm").value(348));
    }

    @Test
    void rejectsZeroDuration() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754,
                  "durationSeconds": 0
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("durationSeconds must be greater than 0"));
    }

    @Test
    void rejectsFutureRunDate() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754,
                  "runDate": "2999-01-01"
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("runDate must be a date in the past or in the present"));
    }

    @Test
    void rejectsDecimalDuration() throws Exception {
        String request = """
                {
                  "startLocation": "Big Ben, London",
                  "startLatitude": 51.5007,
                  "startLongitude": -0.1246,
                  "endLocation": "Tower Bridge, London",
                  "endLatitude": 51.5055,
                  "endLongitude": -0.0754,
                  "durationSeconds": 1.9
                }
                """;

        mockMvc.perform(post("/api/runs").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deletesRun() throws Exception {
        Run run = saveRun("Big Ben, London", 3.45, LocalDate.of(2026, 9, 28));

        mockMvc.perform(delete("/api/runs/{id}", run.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/runs"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returnsNotFoundWhenDeletingMissingRun() throws Exception {
        mockMvc.perform(delete("/api/runs/{id}", 999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Run with id 999 not found"));
    }

    private Run saveRun(String startLocation, double distanceKm, LocalDate runDate) {
        return runRepository.save(new Run(startLocation, 51.5007, -0.1246,
                "Tower Bridge, London", 51.5055, -0.0754, distanceKm, runDate, null));
    }
}
