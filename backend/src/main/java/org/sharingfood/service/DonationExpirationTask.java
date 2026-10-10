package org.sharingfood.service;

import org.sharingfood.entity.Donation;
import org.sharingfood.entity.DonationStatus;
import org.sharingfood.entity.DonationStatusHistory;
import org.sharingfood.repository.DonationRepository;
import org.sharingfood.repository.DonationStatusHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class DonationExpirationTask {

    private static final Logger logger = LoggerFactory.getLogger(DonationExpirationTask.class);

    private final DonationRepository donationRepository;
    private final DonationStatusHistoryRepository statusHistoryRepository;

    public DonationExpirationTask(DonationRepository donationRepository, DonationStatusHistoryRepository statusHistoryRepository) {
        this.donationRepository = donationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    /**
     * Runs every 60 seconds to automatically expire AVAILABLE donations past their pickup deadline.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void sweepExpiredDonations() {
        Instant now = Instant.now();
        List<Donation> expiredDonations = donationRepository.findByStatusAndPickupAvailableUntilBefore(DonationStatus.AVAILABLE, now);

        if (!expiredDonations.isEmpty()) {
            logger.info("Auto-expiring {} donations whose pickup deadline has elapsed", expiredDonations.size());
            for (Donation donation : expiredDonations) {
                donation.setStatus(DonationStatus.EXPIRED);
                donationRepository.save(donation);

                DonationStatusHistory history = new DonationStatusHistory(
                        donation,
                        DonationStatus.AVAILABLE.name(),
                        DonationStatus.EXPIRED.name(),
                        donation.getCreatedByUser(),
                        "System automatically expired donation past pickup deadline"
                );
                statusHistoryRepository.save(history);
            }
        }
    }
}
