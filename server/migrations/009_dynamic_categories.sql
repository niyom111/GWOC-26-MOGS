-- Migration: Dynamic Categories, Sub-Categories, and Tags for Menu Items
-- Supabase-compatible PostgreSQL migration
-- Created: 2026-01-12

-- ============================================================================
-- UP MIGRATION (Apply Changes)
-- ============================================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, name)
);

-- 3. Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Modify menu_items table
-- Rename old columns to preserve data for migration
ALTER TABLE menu_items RENAME COLUMN category TO category_legacy;
ALTER TABLE menu_items RENAME COLUMN tags TO tags_legacy;

-- Add new FK columns and timestamps
ALTER TABLE menu_items ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN sub_category_id UUID REFERENCES sub_categories(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE menu_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 5. Create menu_item_tags join table (many-to-many)
CREATE TABLE IF NOT EXISTS menu_item_tags (
    menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, tag_id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sub_category_id ON menu_items(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_tags_menu_item_id ON menu_item_tags(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_tags_tag_id ON menu_item_tags(tag_id);

-- 7. Create updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Apply triggers to new tables
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_categories_updated_at
    BEFORE UPDATE ON sub_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- DOWN MIGRATION (Rollback Changes)
-- Run these queries separately if you need to rollback
-- ============================================================================

-- DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
-- DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
-- DROP TRIGGER IF EXISTS update_sub_categories_updated_at ON sub_categories;
-- DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- DROP INDEX IF EXISTS idx_menu_item_tags_tag_id;
-- DROP INDEX IF EXISTS idx_menu_item_tags_menu_item_id;
-- DROP INDEX IF EXISTS idx_sub_categories_category_id;
-- DROP INDEX IF EXISTS idx_menu_items_sub_category_id;
-- DROP INDEX IF EXISTS idx_menu_items_category_id;

-- DROP TABLE IF EXISTS menu_item_tags;

-- ALTER TABLE menu_items DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE menu_items DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE menu_items DROP COLUMN IF EXISTS sub_category_id;
-- ALTER TABLE menu_items DROP COLUMN IF EXISTS category_id;
-- ALTER TABLE menu_items RENAME COLUMN category_legacy TO category;
-- ALTER TABLE menu_items RENAME COLUMN tags_legacy TO tags;

-- DROP TABLE IF EXISTS tags;
-- DROP TABLE IF EXISTS sub_categories;
-- DROP TABLE IF EXISTS categories;
