package org.sharingfood.service;

import org.sharingfood.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path uploadPath;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"
    );

    public LocalFileStorageService(@Value("${app.upload.dir:./uploads}") String uploadDir) {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + this.uploadPath, e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, WEBP, GIF, and PDF are permitted.");
        }

        // Limit size: 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds maximum allowed limit of 10MB.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = this.uploadPath.resolve(fileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file: " + fileName, ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }
        String fileName = fileUrl.replace("/uploads/", "");
        try {
            Path filePath = this.uploadPath.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }
}
