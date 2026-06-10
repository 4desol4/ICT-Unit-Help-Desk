-- Drop and recreate the user with proper role inheritance
DROP USER IF EXISTS ict_local_user;
CREATE USER ict_local_user WITH PASSWORD 'local_password';

-- Grant connect on database first
GRANT CONNECT ON DATABASE ict_support_local TO ict_local_user;

-- Connect to the database (this happens in the psql context automatically)
-- Grant all on schema in public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO ict_local_user;

-- Grant all existing tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ict_local_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ict_local_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ict_local_user;

-- Set default privileges for future tables created in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ict_local_user;

-- Verify permissions
SELECT 'User ict_local_user recreated with full permissions' as status;
