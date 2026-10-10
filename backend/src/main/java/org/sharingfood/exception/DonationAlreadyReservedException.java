package org.sharingfood.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DonationAlreadyReservedException extends RuntimeException {
    public DonationAlreadyReservedException(String message) {
        super(message);
    }
}
