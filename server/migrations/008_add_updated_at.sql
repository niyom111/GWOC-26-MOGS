-- Up
ALTER TABLE franchise_enquiries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Down
-- ALTER TABLE franchise_enquiries DROP COLUMN updated_at;
