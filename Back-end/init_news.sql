-- =========================================
-- Injast News DB: schema + seed data
-- =========================================

-- (Optional) create database & role
-- CREATE ROLE newsapp WITH LOGIN PASSWORD 'strong_password';
CREATE DATABASE newsdb;
\c newsdb

-- Extensions (for gen_random_uuid; requires PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================
-- Tables
-- =====================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Agencies
CREATE TABLE IF NOT EXISTS agencies (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  website   VARCHAR(255),
  image_url TEXT
);

-- News
CREATE TABLE IF NOT EXISTS news (
  id          SERIAL PRIMARY KEY,
  uuid        UUID NOT NULL DEFAULT gen_random_uuid(),  -- auto UUID
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  image_url   TEXT,
  category_id INT  NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  agency_id   INT  NOT NULL REFERENCES agencies(id)   ON DELETE RESTRICT,
  pubDate     INTEGER,
  link        TEXT
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_news_uuid        ON news (uuid);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news (category_id);
CREATE INDEX IF NOT EXISTS idx_news_agency_id   ON news (agency_id);
CREATE INDEX IF NOT EXISTS idx_news_link        ON news (link);

-- =====================
-- Seed data
-- =====================

-- Agencies (id, name, website, image_url)
-- NOTE: image_url left NULL for now; replace with real logo URLs if you have them.
INSERT INTO agencies (id, name, website, image_url) VALUES
  (1, 'خبرگزاری انتخاب', 'https://www.entekhab.ir/', NULL),
  (2, 'خبرگزاری تسنیم', 'https://www.tasnimnews.com/', NULL),
  (3, 'خبرگزاری مهر', 'https://www.mehrnews.com/', NULL),
  (4, 'خبرگزاری خبرنگاران جوان', 'https://www.yjc.ir/', NULL),
  (5, 'خبرگزاری صدا و سیما', 'https://www.iribnews.ir/', NULL),
  (6, 'خبرگزاری ایرنا', 'https://www.irna.ir/', NULL),
  (7, 'خبرگزاری دانشجو', 'https://www.snn.ir/', NULL),
  (8, 'عصر ایران', 'https://www.asriran.com/', NULL),
  (9, 'ورزش ۳', 'https://www.varzesh3.com/', NULL)
ON CONFLICT (id) DO NOTHING;

-- Categories (id, name)
INSERT INTO categories (id, name) VALUES
  (1, 'سیاسی و بین الملل'),
  (2, 'اقتصادی'),
  (3, 'جامعه'),
  (4, 'ورزشی'),
  (5, 'فرهنگ و هنر'),
  (6, 'فناوری')
ON CONFLICT (id) DO NOTHING;

-- Ensure sequences continue after fixed IDs
SELECT setval(pg_get_serial_sequence('agencies','id'),   COALESCE((SELECT MAX(id) FROM agencies), 1), true);
SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);
SELECT setval(pg_get_serial_sequence('news','id'),       COALESCE((SELECT MAX(id) FROM news), 1), true);

-- (Optional) privileges if you created a dedicated role
-- GRANT USAGE, SELECT ON SEQUENCE agencies_id_seq   TO newsapp;
-- GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO newsapp;
-- GRANT USAGE, SELECT ON SEQUENCE news_id_seq       TO newsapp;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO newsapp;

-- Done.
