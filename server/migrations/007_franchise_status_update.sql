-- Up
ALTER TABLE franchise_enquiries 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'New';

-- Down
-- ALTER TABLE franchise_enquiries DROP COLUMN status;
