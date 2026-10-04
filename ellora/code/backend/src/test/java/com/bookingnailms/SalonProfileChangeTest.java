package com.bookingnailms;

import com.bookingnailms.dto.salon.SalonRequest;
import com.bookingnailms.entity.*;
import com.bookingnailms.entity.SalonProfileChange.*;
import com.bookingnailms.enums.SalonStatus;
import com.bookingnailms.repository.*;
import com.bookingnailms.service.SalonProfileChangeService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SalonProfileChangeTest {
    final SalonRepository salons = mock(SalonRepository.class);
    final SalonProfileChangeRepository changes = mock(SalonProfileChangeRepository.class);
    final EntityManager em = mock(EntityManager.class);
    final SalonProfileChangeService service = new SalonProfileChangeService(salons, changes, em);
    final UUID owner = UUID.randomUUID(), admin = UUID.randomUUID();
    final Salon salon = Salon.builder().id(42L).name("Old").address("Address").city("HCM").district("Q1")
            .owner(User.builder().id(owner).build()).status(SalonStatus.ACTIVE).logoUrl("old-cover")
            .imageUrls(new ArrayList<>(List.of("old-gallery"))).build();

    SalonProfileChangeTest() {
        when(salons.findByOwnerId(owner)).thenReturn(Optional.of(salon));
        when(salons.findForUpdateById(42L)).thenReturn(Optional.of(salon));
        when(changes.save(any())).thenAnswer(call -> {
            SalonProfileChange c = call.getArgument(0);c.setId(1L);
            when(changes.findById(1L)).thenReturn(Optional.of(c));
            when(changes.findFirstBySalonIdOrderByIdDesc(42L)).thenReturn(Optional.of(c));
            return c;
        });
    }

    SalonRequest request() { return new SalonRequest(" New ","Description","New address","HCM","Q2","0901234567","salon@example.com"); }

    @Test void approveAppliesTextOnlyAndCannotBeRepeated() {
        service.submit(owner, request());assertEquals("Old",salon.getName());
        service.review(1L,true,admin);
        assertEquals("New",salon.getName());assertEquals("New address",salon.getAddress());
        assertEquals("Q2",salon.getDistrict());assertEquals("0901234567",salon.getPhone());
        assertEquals(SalonStatus.ACTIVE,salon.getStatus());assertEquals(owner,salon.getOwner().getId());
        assertEquals("old-cover",salon.getLogoUrl());assertEquals(List.of("old-gallery"),salon.getImageUrls());
        var latest=service.latest(owner);assertEquals(Status.APPROVED,latest.status());assertNotNull(latest.reviewedAt());
        assertEquals(admin,changes.findById(1L).orElseThrow().getReviewedBy());
        assertThrows(ResponseStatusException.class,()->service.review(1L,false,admin));
        verify(salons,times(1)).save(salon);
    }

    @Test void rejectionKeepsPublicProfileAndPendingSubmissionIsBlocked() {
        service.submit(owner,request());
        when(changes.existsBySalonIdAndStatus(42L,Status.PENDING)).thenReturn(true);
        assertThrows(ResponseStatusException.class,()->service.submit(owner,request()));
        assertThrows(ResponseStatusException.class,()->service.submitPhoto(salon,Kind.COVER,"new",List.of()));
        verify(changes,times(1)).save(any());
        service.review(1L,false,admin);assertEquals("Old",salon.getName());
        assertEquals(Status.REJECTED,service.latest(owner).status());verify(salons,never()).save(any());
        when(changes.existsBySalonIdAndStatus(42L,Status.PENDING)).thenReturn(false);
        assertEquals(Status.PENDING,service.submit(owner,request()).status());
    }

    @Test void coverAndGalleryOnlyChangeAfterApproval() {
        service.submitPhoto(salon,Kind.COVER,"new-cover",salon.getImageUrls());
        assertEquals("old-cover",salon.getLogoUrl());
        service.review(1L,true,admin);assertEquals("new-cover",salon.getLogoUrl());
        service.submitPhoto(salon,Kind.GALLERY,salon.getLogoUrl(),List.of("old-gallery","new-gallery"));
        assertEquals(List.of("old-gallery"),salon.getImageUrls());
        service.review(1L,true,admin);assertEquals(List.of("old-gallery","new-gallery"),salon.getImageUrls());
        service.submitPhoto(salon,Kind.COVER,null,salon.getImageUrls());
        service.review(1L,false,admin);assertEquals("new-cover",salon.getLogoUrl());
        service.submitPhoto(salon,Kind.COVER,null,salon.getImageUrls());
        service.review(1L,true,admin);assertNull(salon.getLogoUrl());assertEquals("Old",salon.getName());
    }

    @Test void stalePhotoApprovalDoesNotUndoAdminModeration() {
        service.submitPhoto(salon,Kind.GALLERY,salon.getLogoUrl(),List.of("old-gallery","new"));
        salon.getImageUrls().clear();
        assertThrows(ResponseStatusException.class,()->service.review(1L,true,admin));
        assertTrue(salon.getImageUrls().isEmpty());assertEquals(Status.PENDING,service.latest(owner).status());
        service.review(1L,false,admin);assertEquals(Status.REJECTED,service.latest(owner).status());
    }

    @Test void waitingReviewerSeesDecisionMadeWhileWaitingForLock() {
        service.submit(owner,request());
        doAnswer(call->{((SalonProfileChange)call.getArgument(0)).setStatus(Status.REJECTED);return null;}).when(em).refresh(any(SalonProfileChange.class));
        assertThrows(ResponseStatusException.class,()->service.review(1L,true,admin));
        assertEquals("Old",salon.getName());verify(salons,never()).save(any());
    }
}
