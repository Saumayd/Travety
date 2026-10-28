-- ============================================================================
-- Travety Supabase PostgreSQL Schema Migration
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Saumay',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Lobbies Table
CREATE TABLE IF NOT EXISTS lobbies (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    host_name TEXT NOT NULL,
    host_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    central_hub TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    active_pings INTEGER NOT NULL DEFAULT 5,
    last_ping_by TEXT NOT NULL,
    sos_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Squad Members Table
CREATE TABLE IF NOT EXISTS squad_members (
    id TEXT PRIMARY KEY,
    lobby_code TEXT NOT NULL,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    curfew TEXT NOT NULL,
    accompanying_details TEXT NOT NULL,
    budget INTEGER NOT NULL,
    phone TEXT NOT NULL,
    leave_by_time TEXT NOT NULL,
    transit_mins INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
    id TEXT PRIMARY KEY,
    lobby_code TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    votes INTEGER NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Area Reviews Table
CREATE TABLE IF NOT EXISTS area_reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    area_name TEXT NOT NULL,
    safety_rating INTEGER NOT NULL,
    lighting_status TEXT NOT NULL,
    issue_flag TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_squad_members_lobby_code ON squad_members(lobby_code);
CREATE INDEX IF NOT EXISTS idx_poll_options_lobby_code ON poll_options(lobby_code);
CREATE INDEX IF NOT EXISTS idx_area_reviews_created_at ON area_reviews(created_at DESC);

