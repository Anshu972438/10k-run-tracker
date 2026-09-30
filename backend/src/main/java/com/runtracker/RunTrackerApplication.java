package com.runtracker;

import java.time.Clock;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RunTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(RunTrackerApplication.class, args);
	}

	// The service asks this clock for "today", so tests can use a fixed date.
	@Bean
	Clock clock() {
		return Clock.systemDefaultZone();
	}

}
