package com.bookingnailms.repository;

import com.bookingnailms.entity.BookingEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BookingEmailRepository extends JpaRepository<BookingEmail, Long> {
    @Query(value = "select * from booking_emails where sent_at is null and next_attempt_at <= current_timestamp order by id limit 10 for update skip locked", nativeQuery = true)
    List<BookingEmail> lockDueEmails();
}
