package com.bookingnailms;

import com.bookingnailms.entity.Salon;
import com.bookingnailms.entity.User;
import com.bookingnailms.repository.SalonRepository;
import com.bookingnailms.repository.UserRepository;
import com.bookingnailms.service.SalonService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.AbstractList;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SalonResponseTest {
    @Test void detailAndOwnRegistrationRemainSerializableAfterPersistenceSessionCloses() throws Exception {
        var sessionOpen = new AtomicBoolean(true);
        var images = new AbstractList<String>() {
            public String get(int index) {
                if (!sessionOpen.get()) throw new IllegalStateException("Persistence session closed");
                return "https://example.com/salon.jpg";
            }
            public int size() {
                if (!sessionOpen.get()) throw new IllegalStateException("Persistence session closed");
                return 1;
            }
        };
        var ownerId = UUID.randomUUID();
        var salon = Salon.builder().id(1L).owner(User.builder().id(ownerId).build()).imageUrls(images).build();
        var repository = mock(SalonRepository.class);
        when(repository.findById(1L)).thenReturn(Optional.of(salon));
        when(repository.findByOwnerId(ownerId)).thenReturn(Optional.of(salon));
        var service = new SalonService(repository, mock(UserRepository.class));
        var detail = service.getSalonById(1L);
        var ownRegistration = service.getMySalon(ownerId);
        sessionOpen.set(false);
        var mapper = new ObjectMapper();
        assertTrue(mapper.writeValueAsString(detail).contains("https://example.com/salon.jpg"));
        assertTrue(mapper.writeValueAsString(ownRegistration).contains("https://example.com/salon.jpg"));
    }
}
