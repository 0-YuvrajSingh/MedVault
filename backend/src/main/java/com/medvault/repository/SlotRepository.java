package com.medvault.repository;

import com.medvault.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {

    List<Slot> findByDoctor_Id(UUID doctorId);

    List<Slot> findByDoctor_IdAndAvailableTrue(UUID doctorId);

    List<Slot> findByDoctor_IdAndStartTimeAfter(UUID doctorId, LocalDateTime dateTime);

    List<Slot> findByDoctor_IdAndAvailableTrueAndStartTimeAfter(UUID doctorId, LocalDateTime dateTime);
}
