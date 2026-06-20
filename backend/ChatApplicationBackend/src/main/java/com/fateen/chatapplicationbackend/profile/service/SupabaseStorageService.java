package com.fateen.chatapplicationbackend.profile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final long MAX_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final RestClient restClient;
    private final String supabaseUrl;
    private final String bucket;

    public SupabaseStorageService(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.service-role-key}") String serviceRoleKey,
            @Value("${supabase.storage.bucket}") String bucket
    ) {
        this.supabaseUrl = supabaseUrl.replaceAll("/$", "");
        this.bucket = bucket;

        this.restClient = RestClient.builder()
                .baseUrl(this.supabaseUrl)
                .defaultHeader("apikey", serviceRoleKey)
                .build();
    }

    public UploadedImage upload(
            Long userId,
            MultipartFile image
    ) {
        validate(image);

        String extension = getExtension(Objects.requireNonNull(image.getContentType()));

        String path = "users/"
                + userId
                + "/"
                + UUID.randomUUID()
                + extension;

        try {
            restClient.post()
                    .uri("/storage/v1/object/{bucket}/{path}", bucket, path)
                    .contentType(
                            MediaType.parseMediaType(image.getContentType())
                    )
                    .header("x-upsert", "false")
                    .body(image.getBytes())
                    .retrieve()
                    .toBodilessEntity();

            return new UploadedImage(
                    path,
                    getPublicUrl(path)
            );

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Could not read profile image",
                    exception
            );
        } catch (Exception exception) {
            throw new RuntimeException(
                    "Could not upload profile image",
                    exception
            );
        }
    }

    public String getPublicUrl(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }

        return supabaseUrl
                + "/storage/v1/object/public/"
                + bucket
                + "/"
                + path;
    }

    private void validate(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException(
                    "Profile image is required"
            );
        }

        if (image.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException(
                    "Image must be smaller than 5 MB"
            );
        }

        String contentType = image.getContentType();

        if (contentType == null
                || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG and WebP images are allowed"
            );
        }
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Unsupported image type"
            );
        };
    }

    public record UploadedImage(
            String path,
            String publicUrl
    ) {
    }
}