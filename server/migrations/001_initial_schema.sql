-- Initial schema creation
-- This migration creates all base tables

CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    caffeine TEXT,
    image TEXT,
    description TEXT,
    tags TEXT
);

CREATE TABLE IF NOT EXISTS art_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    price INTEGER NOT NULL,
    status TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS workshops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    datetime TEXT NOT NULL,
    seats INTEGER NOT NULL,
    booked INTEGER NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    date TEXT,
    pickupTime TEXT
);

CREATE TABLE IF NOT EXISTS trending_items_7d (
    item_id TEXT PRIMARY KEY,
    total_quantity INTEGER NOT NULL
);

