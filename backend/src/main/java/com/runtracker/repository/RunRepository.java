package com.runtracker.repository;

import com.runtracker.entity.Run;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RunRepository extends JpaRepository<Run, Long> {

    List<Run> findAllByOrderByRunDateDescCreatedAtDescIdDesc();

    @Query("SELECT COALESCE(SUM(r.distanceKm), 0.0) FROM Run r")
    double sumDistanceKm();
}
