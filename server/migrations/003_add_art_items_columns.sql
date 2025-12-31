-- Add new columns to art_items table
-- These columns extend the art items functionality

ALTER TABLE art_items ADD COLUMN stock INTEGER DEFAULT 1;
ALTER TABLE art_items ADD COLUMN artist_name TEXT;
ALTER TABLE art_items ADD COLUMN artist_bio TEXT;
ALTER TABLE art_items ADD COLUMN description TEXT;

-- Migrate existing artist data to artist_name
UPDATE art_items SET artist_name = artist WHERE artist_name IS NULL AND artist IS NOT NULL AND artist != '';

