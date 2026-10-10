package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "post_likes")
public class PostLike {

    @EmbeddedId
    private PostLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PostLike() {}

    public PostLike(Post post, User user) {
        this.post = post;
        this.user = user;
        this.id = new PostLikeId(post.getId(), user.getId());
    }

    public PostLikeId getId() {
        return id;
    }

    public void setId(PostLikeId id) {
        this.id = id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
