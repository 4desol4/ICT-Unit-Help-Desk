-- Fix permissions for ict_local_user on ict_support_local database

-- Connect to the database first (PostgreSQL requirement)
-- Run this as postgres user

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ict_local_user;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO ict_local_user;

-- Grant all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ict_local_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ict_local_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ict_local_user;

-- Alternative: if above doesn't work, try this simpler approach
-- GRANT pg_default TO ict_local_user;
