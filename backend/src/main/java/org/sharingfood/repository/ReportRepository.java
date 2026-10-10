package org.sharingfood.repository;

import org.sharingfood.entity.Report;
import org.sharingfood.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(ReportStatus status);
}
