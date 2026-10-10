package org.sharingfood.dto;

import java.time.Instant;
import java.util.UUID;

public class CommentDto {
    private UUID id;
    private UUID postId;
    private UUID userId;
    private String userName;
    private String userRole;
    private String userAvatarUrl;
    private String content;
    private Instant createdAt;

    public CommentDto() {}

    public CommentDto(UUID id, UUID postId, UUID userId, String userName, String userRole, String userAvatarUrl, String content, Instant createdAt) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.userName = userName;
        this.userRole = userRole;
        this.userAvatarUrl = userAvatarUrl;
        this.content = content;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getPostId() {
        return postId;
    }

    public void setPostId(UUID postId) {
        this.postId = postId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getUserAvatarUrl() {
        return userAvatarUrl;
    }

    public void setUserAvatarUrl(String userAvatarUrl) {
        this.userAvatarUrl = userAvatarUrl;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
