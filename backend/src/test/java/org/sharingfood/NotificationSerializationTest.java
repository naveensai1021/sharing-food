package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.NotificationDto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class NotificationSerializationTest {

    @Test
    public void testSerialization() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        NotificationDto dto = new NotificationDto(
                UUID.randomUUID(),
                "Account Approved",
                "Your account is approved",
                "VERIFICATION",
                "/dashboard",
                false,
                Instant.now()
        );

        String json = mapper.writeValueAsString(List.of(dto));
        assertNotNull(json);
        assertTrue(json.contains("\"isRead\":false"));

        dto.setRead(true);
        String jsonRead = mapper.writeValueAsString(List.of(dto));
        assertTrue(jsonRead.contains("\"isRead\":true"));

        NotificationDto deserialized = mapper.readValue(mapper.writeValueAsString(dto), NotificationDto.class);
        assertTrue(deserialized.isRead());
    }
}
