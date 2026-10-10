package org.sharingfood.controller;

import jakarta.validation.Valid;
import org.sharingfood.dto.*;
import org.sharingfood.entity.Report;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<PostDto>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(postService.getPosts(pageable, currentUser != null ? currentUser.getId() : null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(postService.getPostById(id, currentUser != null ? currentUser.getId() : null));
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody CreatePostRequest req,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(req, currentUser.getId()));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(postService.toggleLike(id, currentUser.getId()));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest req,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.addComment(id, req, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/report")
    public ResponseEntity<Map<String, Object>> createReport(
            @Valid @RequestBody CreateReportRequest req,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Report report = postService.createReport(req, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Report submitted for admin review",
                "reportId", report.getId()
        ));
    }
}
