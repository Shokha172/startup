-- AquaMind AI Database Schema & Seed Data SQL Script
-- Run this in the SQL Editor of your Supabase Dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS irrigation_logs CASCADE;
DROP TABLE IF EXISTS crop_analyses CASCADE;
DROP TABLE IF EXISTS farms CASCADE;

-- 1. Farms Directory Table
CREATE TABLE farms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  total_area_hectares DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crop Analytics & History Table
CREATE TABLE crop_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_type VARCHAR(100) NOT NULL,
  image_url TEXT,
  diagnosis TEXT NOT NULL,
  risk_level VARCHAR(50) NOT NULL, -- Low, Medium, High
  confidence_score DOUBLE PRECISION NOT NULL,
  recommendations TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Irrigation Logs Table
CREATE TABLE irrigation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  crop_type VARCHAR(100) NOT NULL,
  water_amount_liters DOUBLE PRECISION NOT NULL,
  duration_minutes INTEGER NOT NULL,
  savings_achieved_percent DOUBLE PRECISION DEFAULT 0.0,
  watered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Agronomist Chat Sessions Table
CREATE TABLE chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_title VARCHAR(255) DEFAULT 'Yangi Suhbat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Chat Messages Table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender VARCHAR(50) CHECK (sender IN ('user', 'ai')) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Mock Farms
INSERT INTO farms (id, name, owner_name, region, latitude, longitude, total_area_hectares)
VALUES 
('f05d5351-419b-4393-8ef4-6f5dfba21f01', 'AquaMind Bukhara Central', 'Karim Alimov', 'Buxoro', 40.0150, 64.4300, 12.0),
('f05d5351-419b-4393-8ef4-6f5dfba21f02', 'Buloqboshi G''o''za Field', 'Shavkat Karimov', 'Farg''ona', 40.7500, 72.2500, 8.5);

-- Insert Crop Analyses Seed
INSERT INTO crop_analyses (farm_id, crop_type, diagnosis, risk_level, confidence_score, recommendations)
VALUES 
('f05d5351-419b-4393-8ef4-6f5dfba21f01', 'Kuzgi Bug''doy', 'Sariq zang kasalligi ehtimoli aniqlandi (Puccinia striiformis)', 'Medium', 0.912, 
 ARRAY['Triazol sinfidagi fungitsid sepish', 'Sug''orishni 48 soatga kechiktirish', 'Kaliy o''g''itlari miqdorini oshirish']),
('f05d5351-419b-4393-8ef4-6f5dfba21f02', 'G''o''za', 'O''rgimchakkana zararkunandasi boshlang''ich bosqichi', 'Low', 0.850, 
 ARRAY['Akaritsid preparatlar seping', 'Daladagi begona o''tlarni tozalang']);

-- Insert Irrigation Logs Seed
INSERT INTO irrigation_logs (farm_id, crop_type, water_amount_liters, duration_minutes, savings_achieved_percent)
VALUES 
('f05d5351-419b-4393-8ef4-6f5dfba21f01', 'Kuzgi Bug''doy', 42000.0, 180, 15.2),
('f05d5351-419b-4393-8ef4-6f5dfba21f01', 'Kuzgi Bug''doy', 38000.0, 160, 22.0),
('f05d5351-419b-4393-8ef4-6f5dfba21f01', 'Kuzgi Bug''doy', 45000.0, 190, 18.5),
('f05d5351-419b-4393-8ef4-6f5dfba21f02', 'G''o''za', 35000.0, 150, 28.0),
('f05d5351-419b-4393-8ef4-6f5dfba21f02', 'G''o''za', 30000.0, 130, 32.1);

-- Insert Chat Sessions
INSERT INTO chat_sessions (id, session_title)
VALUES ('c05d5351-419b-4393-8ef4-6f5dfba21f10', 'Boshlang''ich Suhbat');

-- Insert Chat Messages Seed
INSERT INTO chat_messages (session_id, sender, message)
VALUES 
('c05d5351-419b-4393-8ef4-6f5dfba21f10', 'user', 'G''o''za bargida sariq dog''lar ko''rindi. Sababi nima bo''lishi mumkin?'),
('c05d5351-419b-4393-8ef4-6f5dfba21f10', 'ai', 'Bu o''rgimchakkana yoki kaltsiy yetishmovchiligi bo''lishi mumkin. To''liqroq tahlil qilish uchun barg suratini "Ekin Analizi" bo''limiga yuklashingizni tavsiya qilaman.');
