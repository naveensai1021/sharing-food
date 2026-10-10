package org.sharingfood.service;

import org.sharingfood.dto.*;
import org.sharingfood.entity.*;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final ReportRepository reportRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    public PostService(
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            ReportRepository reportRepository,
            OrganizationMemberRepository organizationMemberRepository,
            NotificationService notificationService,
            AuditService auditService,
            UserRepository userRepository
    ) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.reportRepository = reportRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getPosts(Pageable pageable, UUID currentUserId) {
        Page<Post> postPage = postRepository.findAllByOrderByCreatedAtDesc(pageable);
        return postPage.map(p -> mapToDto(p, currentUserId));
    }

    @Transactional(readOnly = true)
    public Page<PostDto> getPosts(Pageable pageable, User currentUser) {
        return getPosts(pageable, currentUser != null ? currentUser.getId() : null);
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(UUID postId, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
        return mapToDto(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(UUID postId, User currentUser) {
        return getPostById(postId, currentUser != null ? currentUser.getId() : null);
    }

    @Transactional
    public PostDto createPost(CreatePostRequest req, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));
        return createPost(req, currentUser);
    }

    @Transactional
    public PostDto createPost(CreatePostRequest req, User currentUser) {
        Organization org = null;
        Optional<OrganizationMember> membership = organizationMemberRepository.findByUserId(currentUser.getId());
        if (membership.isPresent()) {
            org = membership.get().getOrganization();
        }

        Post post = new Post(currentUser, org, req.getContent(), req.getCity(), req.getTags());

        if (req.getImageUrls() != null) {
            for (String url : req.getImageUrls()) {
                if (url != null && !url.trim().isEmpty()) {
                    post.addImage(new PostImage(url.trim()));
                }
            }
        }

        Post saved = postRepository.save(post);
        auditService.log(currentUser, "CREATE_POST", "POST", saved.getId(), "User created community post");

        return mapToDto(saved, currentUser.getId());
    }

    @Transactional
    public Map<String, Object> toggleLike(UUID postId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));
        return toggleLike(postId, currentUser);
    }

    @Transactional
    public Map<String, Object> toggleLike(UUID postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Optional<PostLike> existingLike = postLikeRepository.findByIdPostIdAndIdUserId(postId, currentUser.getId());
        boolean likedNow;

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            likedNow = false;
        } else {
            PostLike newLike = new PostLike(post, currentUser);
            postLikeRepository.save(newLike);
            post.setLikesCount(post.getLikesCount() + 1);
            likedNow = true;

            // Notify post author if not self
            if (!post.getAuthorUser().getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        post.getAuthorUser(),
                        "New Like on your Post",
                        (currentUser.getUserProfile() != null ? currentUser.getUserProfile().getFullName() : "Someone") + " liked your post.",
                        "COMMUNITY",
                        "/community"
                );
            }
        }

        postRepository.save(post);

        return Map.of(
                "postId", postId,
                "likesCount", post.getLikesCount(),
                "hasLiked", likedNow
        );
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(UUID postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }

        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(UUID postId, CreateCommentRequest req, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));
        return addComment(postId, req, currentUser);
    }

    @Transactional
    public CommentDto addComment(UUID postId, CreateCommentRequest req, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        Comment comment = new Comment(post, currentUser, req.getContent());
        Comment savedComment = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // Notify post author
        if (!post.getAuthorUser().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    post.getAuthorUser(),
                    "New Comment on your Post",
                    (currentUser.getUserProfile() != null ? currentUser.getUserProfile().getFullName() : "Someone") + " commented: \"" + (req.getContent().length() > 30 ? req.getContent().substring(0, 30) + "..." : req.getContent()) + "\"",
                    "COMMUNITY",
                    "/community"
            );
        }

        return mapCommentToDto(savedComment);
    }

    @Transactional
    public void deletePost(UUID postId, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));
        deletePost(postId, currentUser);
    }

    @Transactional
    public void deletePost(UUID postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        boolean isAuthor = post.getAuthorUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));

        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to delete this post");
        }

        postRepository.delete(post);
        auditService.log(currentUser, "DELETE_POST", "POST", postId, "Post deleted by " + (isAdmin ? "Admin" : "Author"));
    }

    @Transactional
    public Report createReport(CreateReportRequest req, UUID currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUserId));
        return createReport(req, currentUser);
    }

    @Transactional
    public Report createReport(CreateReportRequest req, User currentUser) {
        Report report = new Report(currentUser, req.getTargetType(), req.getTargetId(), req.getReason(), req.getDescription());
        Report saved = reportRepository.save(report);
        auditService.log(currentUser, "CREATE_REPORT", "REPORT", saved.getId(), "Report filed against " + req.getTargetType() + " " + req.getTargetId());
        return saved;
    }

    private PostDto mapToDto(Post p, UUID currentUserId) {
        PostDto dto = new PostDto();
        dto.setId(p.getId());
        dto.setAuthorUserId(p.getAuthorUser().getId());

        if (p.getAuthorUser().getUserProfile() != null) {
            dto.setAuthorName(p.getAuthorUser().getUserProfile().getFullName());
            dto.setAuthorAvatarUrl(p.getAuthorUser().getUserProfile().getAvatarUrl());
        } else {
            dto.setAuthorName(p.getAuthorUser().getEmail().split("@")[0]);
        }

        if (!p.getAuthorUser().getRoles().isEmpty()) {
            dto.setAuthorRole(p.getAuthorUser().getRoles().iterator().next().getName());
        }

        if (p.getOrganization() != null) {
            dto.setOrganizationId(p.getOrganization().getId());
            dto.setOrganizationName(p.getOrganization().getName());
        }

        if (p.getDonation() != null) {
            dto.setDonationId(p.getDonation().getId());
        }

        dto.setContent(p.getContent());
        dto.setCity(p.getCity());
        dto.setTags(p.getTags());
        dto.setLikesCount(p.getLikesCount());
        dto.setCommentsCount(p.getCommentsCount());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getImages() != null) {
            dto.setImageUrls(p.getImages().stream().map(PostImage::getImageUrl).collect(Collectors.toList()));
        }

        if (currentUserId != null) {
            dto.setHasLiked(postLikeRepository.existsByIdPostIdAndIdUserId(p.getId(), currentUserId));
        } else {
            dto.setHasLiked(false);
        }

        return dto;
    }

    private CommentDto mapCommentToDto(Comment c) {
        CommentDto dto = new CommentDto();
        dto.setId(c.getId());
        dto.setPostId(c.getPost().getId());
        dto.setUserId(c.getUser().getId());

        if (c.getUser().getUserProfile() != null) {
            dto.setUserName(c.getUser().getUserProfile().getFullName());
            dto.setUserAvatarUrl(c.getUser().getUserProfile().getAvatarUrl());
        } else {
            dto.setUserName(c.getUser().getEmail().split("@")[0]);
        }

        if (!c.getUser().getRoles().isEmpty()) {
            dto.setUserRole(c.getUser().getRoles().iterator().next().getName());
        }

        dto.setContent(c.getContent());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
