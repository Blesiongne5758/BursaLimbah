-- ============================================
-- BURSA LIMBAH - SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'SELLER', 'BUYER', 'ADMIN')),
  membership_tier TEXT DEFAULT 'PERSONAL' CHECK (membership_tier IN ('PERSONAL', 'SMALL_BUSINESS', 'CORPORATE')),
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  city TEXT,
  province TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company info table
CREATE TABLE IF NOT EXISTS company_info (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  npwp TEXT,
  nib TEXT,
  business_license TEXT,
  industry_sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('PLASTIC', 'PAPER', 'METAL', 'ELECTRONIC', 'ORGANIC', 'B3', 'INDUSTRIAL', 'TEXTILE', 'CONSTRUCTION')),
  sub_category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'ton', 'liter', 'm3', 'unit')),
  base_price DECIMAL NOT NULL CHECK (base_price > 0),
  negotiable BOOLEAN DEFAULT true,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  encrypted_coords TEXT,
  location_hash TEXT,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'NEGOTIATING', 'SOLD', 'ARCHIVED')),
  ai_generated BOOLEAN DEFAULT false,
  price_tier TEXT DEFAULT 'BRONZE' CHECK (price_tier IN ('BRONZE', 'SILVER', 'GOLD')),
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  quantity DECIMAL NOT NULL CHECK (quantity > 0),
  price_per_kg DECIMAL NOT NULL CHECK (price_per_kg > 0),
  total_price DECIMAL NOT NULL CHECK (total_price > 0),
  down_payment DECIMAL NOT NULL CHECK (down_payment > 0),
  final_price DECIMAL,
  payment_method TEXT DEFAULT 'MIDTRANS' CHECK (payment_method IN ('MIDTRANS', 'XENDIT', 'BANK_TRANSFER', 'CRYPTO')),
  escrow_status TEXT DEFAULT 'PENDING' CHECK (escrow_status IN ('PENDING', 'HOLD', 'RELEASED', 'REFUNDED')),
  pickup_method TEXT DEFAULT 'SELF' CHECK (pickup_method IN ('SELF', 'COURIER')),
  courier_id TEXT,
  pickup_date TIMESTAMP WITH TIME ZONE,
  estimated_pickup TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'BOOKED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'NEGOTIATING', 'BOOKED', 'PAID_DP', 'READY_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'VALIDATED', 'COMPLETED', 'REVIEWED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validations table
CREATE TABLE IF NOT EXISTS validations (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  actual_quantity DECIMAL NOT NULL,
  actual_photos TEXT[],
  final_price DECIMAL NOT NULL,
  condition_notes TEXT,
  validated_by UUID REFERENCES users(id),
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_agent BOOLEAN DEFAULT false,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, conversation_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  is_ai BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  tool_calls JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table (Blockchain)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  address TEXT UNIQUE NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  balance DECIMAL DEFAULT 0 CHECK (balance >= 0),
  token_balance DECIMAL DEFAULT 0 CHECK (token_balance >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'DISTRIBUTION')),
  amount DECIMAL NOT NULL CHECK (amount > 0),
  token TEXT DEFAULT 'BLW',
  tx_hash TEXT UNIQUE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  from_address TEXT,
  to_address TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  category TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File records
CREATE TABLE IF NOT EXISTS file_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('listing', 'profile', 'kyc', 'chat', 'validation')),
  bucket TEXT NOT NULL CHECK (bucket IN ('public', 'private')),
  key TEXT UNIQUE NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0),
  url TEXT,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_buyer ON bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_records_user ON file_records(user_id);
CREATE INDEX IF NOT EXISTS idx_file_records_category ON file_records(category);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Company info policies
CREATE POLICY "Users can view their own company info"
  ON company_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own company info"
  ON company_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company info"
  ON company_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  USING (auth.uid() = seller_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Wallets policies
CREATE POLICY "Users can view their own wallet"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Wallet transactions policies
CREATE POLICY "Users can view their own wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own wallet transactions"
  ON wallet_transactions FOR INSERT
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM wallets WHERE user_id = auth.uid()
    )
  );

-- Feature flags policies
CREATE POLICY "Feature flags are viewable by everyone"
  ON feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- File records policies
CREATE POLICY "Users can view their own files"
  ON file_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON file_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON file_records FOR DELETE
  USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON company_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_records_updated_at BEFORE UPDATE ON file_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default feature flags
INSERT INTO feature_flags (key, name, description, category, enabled) VALUES
('marketplace_enabled', 'Marketplace', 'Aktifkan fitur marketplace', 'core', true),
('ai_chat_enabled', 'AI Chat Assistant', 'Aktifkan asisten AI', 'core', true),
('escrow_payment_enabled', 'Escrow Payment', 'Aktifkan sistem escrow', 'core', true),
('midtrans_enabled', 'Midtrans', 'Aktifkan Midtrans payment', 'payment', true),
('crypto_payment_enabled', 'Crypto Payment', 'Aktifkan pembayaran crypto', 'payment', false),
('bank_transfer_enabled', 'Bank Transfer', 'Aktifkan transfer bank', 'payment', true),
('kyc_ktp_enabled', 'KYC KTP', 'Aktifkan verifikasi KTP', 'kyc', true),
('kyc_npwp_enabled', 'KYC NPWP', 'Aktifkan verifikasi NPWP', 'kyc', true),
('kyc_nib_enabled', 'KYC NIB', 'Aktifkan verifikasi NIB', 'kyc', true),
('shipping_enabled', 'Shipping Calculator', 'Aktifkan kalkulator ongkir', 'shipping', true),
('tracking_enabled', 'Shipment Tracking', 'Aktifkan tracking pengiriman', 'shipping', true),
('bulk_upload_enabled', 'Bulk Upload', 'Aktifkan upload massal', 'advanced', false),
('api_access_enabled', 'API Access', 'Aktifkan akses API publik', 'advanced', false),
('priority_listing_enabled', 'Priority Listing', 'Aktifkan listing prioritas', 'advanced', true),
('blockchain_wallet_enabled', 'Blockchain Wallet', 'Aktifkan wallet crypto', 'blockchain', false),
('crypto_distribution_enabled', 'Crypto Distribution', 'Aktifkan distribusi token', 'blockchain', false),
('nft_listing_enabled', 'NFT Listing', 'Aktifkan listing sebagai NFT', 'blockchain', false),
('email_notifications_enabled', 'Email Notifications', 'Aktifkan notifikasi email', 'communication', true),
('push_notifications_enabled', 'Push Notifications', 'Aktifkan push notification', 'communication', true),
('sms_notifications_enabled', 'SMS Notifications', 'Aktifkan notifikasi SMS', 'communication', false),
('analytics_enabled', 'Analytics', 'Aktifkan tracking analytics', 'analytics', true),
('reporting_enabled', 'Reporting', 'Aktifkan fitur reporting', 'analytics', true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'BursaLimbah Database Schema Created!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables: 13';
  RAISE NOTICE 'Indexes: 20+';
  RAISE NOTICE 'RLS Policies: 25+';
  RAISE NOTICE 'Triggers: 8';
  RAISE NOTICE 'Feature Flags: 22';
  RAISE NOTICE '========================================';
END $$;
