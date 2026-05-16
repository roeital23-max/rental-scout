-- NextAuth.js required tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Drop existing tables cleanly (order matters for foreign keys)
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  name text,
  email text UNIQUE,
  "emailVerified" timestamptz,
  image text
);

CREATE TABLE accounts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  "providerAccountId" text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE sessions (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  "sessionToken" text UNIQUE NOT NULL,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

CREATE TABLE verification_tokens (
  identifier text NOT NULL,
  token text UNIQUE NOT NULL,
  expires timestamptz NOT NULL,
  PRIMARY KEY (identifier, token)
);
