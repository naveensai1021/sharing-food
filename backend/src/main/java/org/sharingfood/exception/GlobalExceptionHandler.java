package org.sharingfood.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler({ForbiddenException.class, AccountSuspendedException.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleForbidden(Exception ex, HttpServletRequest request) {
        String msg = ex.getMessage();
        if (msg == null || msg.trim().isEmpty() || msg.equalsIgnoreCase("Access Denied")) {
            msg = "Unauthorized Supplier: Access denied. Insufficient permissions to perform this operation.";
        }
        return buildResponse(HttpStatus.FORBIDDEN, msg, request.getRequestURI(), null);
    }

    @ExceptionHandler(DonationAlreadyReservedException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(DonationAlreadyReservedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation failed", request.getRequestURI(), fieldErrors);
    }

    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthException(org.springframework.security.core.AuthenticationException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
        ex.printStackTrace();
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected internal error occurred: " + ex.getMessage(), request.getRequestURI(), null);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message, String path, Object details) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", path);
        if (details != null) {
            body.put("details", details);
        }
        return new ResponseEntity<>(body, status);
    }
}
