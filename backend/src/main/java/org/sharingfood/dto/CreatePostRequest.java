package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class CreatePostRequest {

    @NotBlank(message = "Post content cannot be empty")
    private String content;

    private String city;

    private String tags;

    private List<String> imageUrls = new ArrayList<>();

    public CreatePostRequest() {}

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
