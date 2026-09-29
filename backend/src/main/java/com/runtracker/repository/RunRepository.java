package com.runtracker.repository;

import com.runtracker.entity.Run;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RunRepository extends JpaRepository<Run, Long> {

    List<Run> findAllByOrderByRunDateDescCreatedAtDesc();
}
