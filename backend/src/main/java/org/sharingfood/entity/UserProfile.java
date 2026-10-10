package org.sharingfood.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(length = 50)
    private String phone;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 100)
    private String city;

    public UserProfile() {}

    public UserProfile(User user, String fullName, String phone, String city) {
        this.user = user;
        this.fullName = fullName;
        this.phone = phone;
        this.city = city;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
