-- Fix seed users: GoTrue requires token fields to be empty string '', not NULL.
-- Users inserted directly into auth.users via seed had NULL tokens,
-- which causes "Database error querying schema" during password login.

update auth.users
set
  confirmation_token      = coalesce(confirmation_token, ''),
  recovery_token          = coalesce(recovery_token, ''),
  email_change_token_new  = coalesce(email_change_token_new, ''),
  email_change            = coalesce(email_change, ''),
  updated_at              = timezone('utc', now())
where
  confirmation_token is null
  or recovery_token is null
  or email_change_token_new is null
  or email_change is null;
