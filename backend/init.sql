-- EcoGuard Pro Database Initialization
-- This script sets up the database with required extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecoguard') THEN
        CREATE ROLE ecoguard WITH LOGIN PASSWORD 'EcoGuard2024!SecurePassword';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ecoguard_pro TO ecoguard;
GRANT ALL ON SCHEMA public TO ecoguard;

-- Set timezone
SET timezone = 'UTC';