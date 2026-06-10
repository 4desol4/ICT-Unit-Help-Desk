-- Complete fresh setup for ict_support_local database

-- Drop existing database and user
DROP DATABASE IF EXISTS ict_support_local;
DROP USER IF EXISTS ict_local_user;

-- Create new user
CREATE USER ict_local_user WITH PASSWORD 'local_password';

-- Create new database owned by postgres (admin)
CREATE DATABASE ict_support_local OWNER postgres;

-- Connect to new database context (in psql, this would be \c ict_support_local)
-- But these commands work in any context:

-- Grant full privileges to ict_local_user
GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO ict_local_user;

-- Set default privileges so ict_local_user gets access to future objects
ALTER DEFAULT PRIVILEGES IN DATABASE ict_support_local IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN DATABASE ict_support_local IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO ict_local_user;
ALTER DEFAULT PRIVILEGES IN DATABASE ict_support_local IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ict_local_user;

-- Make ict_local_user able to create objects
ALTER ROLE ict_local_user CREATEDB;

SELECT 'Fresh database setup complete - ict_local_user ready!';
