-- Up
CREATE TABLE IF NOT EXISTS franchise_settings (
    id SERIAL PRIMARY KEY,
    contact_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS franchise_faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS franchise_enquiries (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    enquiry TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default contact number if not exists
INSERT INTO franchise_settings (contact_number)
SELECT '+91 98765 43210'
WHERE NOT EXISTS (SELECT 1 FROM franchise_settings);

-- Down
DROP TABLE IF EXISTS franchise_enquiries;
DROP TABLE IF EXISTS franchise_faq;
DROP TABLE IF EXISTS franchise_settings;
