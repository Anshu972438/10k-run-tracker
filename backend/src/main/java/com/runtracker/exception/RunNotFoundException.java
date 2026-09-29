package com.runtracker.exception;

public class RunNotFoundException extends RuntimeException {

    public RunNotFoundException(Long id) {
        super("Run with id " + id + " not found");
    }
}
