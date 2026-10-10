package org.sharingfood.repository;

import org.sharingfood.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Post> findByCityIgnoreCaseOrderByCreatedAtDesc(String city);
    List<Post> findByAuthorUserIdOrderByCreatedAtDesc(UUID authorUserId);
}
