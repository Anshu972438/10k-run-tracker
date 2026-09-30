package com.runtracker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

// Only the date and time can be edited. Changing the locations would change the distance,
// so a run with wrong locations is deleted and added again instead.
public record UpdateRunRequest(
        @NotNull @PastOrPresent LocalDate runDate,
        @Positive @Max(86400) Integer durationSeconds
) {
}
