-- Run once in the Supabase SQL Editor before deploying the backend (ddl-auto: none).
BEGIN;
CREATE TABLE IF NOT EXISTS public.revoked_access_tokens (
    token_hash VARCHAR(64) PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revoked_access_tokens_expires_at
    ON public.revoked_access_tokens (expires_at);
ALTER TABLE public.revoked_access_tokens ENABLE ROW LEVEL SECURITY;
-- Only the trusted backend database role accesses token revocation records.
COMMIT;
