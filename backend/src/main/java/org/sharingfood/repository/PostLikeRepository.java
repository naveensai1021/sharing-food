package org.sharingfood.repository;

import org.sharingfood.entity.PostLike;
import org.sharingfood.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);
    Optional<PostLike> findByIdPostIdAndIdUserId(UUID postId, UUID userId);
    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);
}
