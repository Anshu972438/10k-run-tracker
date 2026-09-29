package com.runtracker.controller;

import com.runtracker.dto.CreateRunRequest;
import com.runtracker.dto.RunResponse;
import com.runtracker.dto.RunSummaryResponse;
import com.runtracker.service.RunService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final RunService runService;

    public RunController(RunService runService) {
        this.runService = runService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RunResponse createRun(@Valid @RequestBody CreateRunRequest request) {
        return runService.createRun(request);
    }

    @GetMapping
    public List<RunResponse> getRuns() {
        return runService.getRuns();
    }

    @GetMapping("/summary")
    public RunSummaryResponse getSummary() {
        return runService.getSummary();
    }
}
