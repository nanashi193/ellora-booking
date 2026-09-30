-- Run once in the Supabase SQL Editor before restarting the backend (ddl-auto: none).
BEGIN;
CREATE TABLE IF NOT EXISTS public.salon_working_hours (
    id BIGSERIAL PRIMARY KEY,
    salon_id BIGINT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    day_of_week VARCHAR(16) NOT NULL,
    open_time TIME,
    close_time TIME,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_salon_working_hours_day UNIQUE (salon_id, day_of_week),
    CONSTRAINT ck_salon_working_hours_interval CHECK (
        closed OR (open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    )
);
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;
-- Access goes through the backend database role, never directly through the public API.
COMMIT;
