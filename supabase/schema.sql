-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    family_name TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Occasions table
CREATE TABLE IF NOT EXISTS occasions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#1a1a2e',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tags: link guests to occasions
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    occasion_id UUID REFERENCES occasions(id) ON DELETE SET NULL,
    occasion_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Invitations log
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE NOT NULL,
    occasion_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tags_guest_id ON tags(guest_id);
CREATE INDEX IF NOT EXISTS idx_tags_occasion_id ON tags(occasion_id);
CREATE INDEX IF NOT EXISTS idx_invitations_guest_id ON invitations(guest_id);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_occurrences_name ON occasions(name);

-- Enable RLS (optional — for single-admin app, you can skip this)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Permissive policies (for dev / single-admin)
CREATE POLICY "Public guests access" ON guests FOR ALL USING (true);
CREATE POLICY "Public occasions access" ON occasions FOR ALL USING (true);
CREATE POLICY "Public tags access" ON tags FOR ALL USING (true);
CREATE POLICY "Public invitations access" ON invitations FOR ALL USING (true);

-- Seed default occasions
INSERT INTO occasions (name, color) VALUES
    ('Son''s Birthday', '#FF6B6B'),
    ('Diwali', '#FFA500'),
    ('Christmas', '#2ECC71'),
    ('Summer BBQ', '#3498DB'),
    ('Daughter''s Birthday', '#9B59B6')
ON CONFLICT (name) DO NOTHING;
