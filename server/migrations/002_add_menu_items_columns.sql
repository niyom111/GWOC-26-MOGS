-- Add new columns to menu_items table
-- These columns were added for contextual recommendations feature

ALTER TABLE menu_items ADD COLUMN caffeine_mg INTEGER;
ALTER TABLE menu_items ADD COLUMN milk_based INTEGER;
ALTER TABLE menu_items ADD COLUMN calories INTEGER;
ALTER TABLE menu_items ADD COLUMN shareable INTEGER;
ALTER TABLE menu_items ADD COLUMN intensity_level TEXT;

