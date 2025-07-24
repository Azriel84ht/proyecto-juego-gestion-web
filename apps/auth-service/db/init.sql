-- Habilita la extensión para generar UUIDs si no está presente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Crea la tabla de usuarios con todas las columnas necesarias
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Puede ser nulo para usuarios OAuth
    google_id TEXT UNIQUE,
    facebook_id TEXT UNIQUE,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    verification_token_expires TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_token_expires TIMESTAMPTZ,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_recovery_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crea la tabla del historial de logins
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(255),
    user_agent TEXT,
    device_info VARCHAR(255),
    location VARCHAR(255),
    login_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);