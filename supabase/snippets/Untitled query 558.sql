-- 1. Add banner_url to the table (If you haven't already in 0002_org_tables.sql)
-- Note: Ideally this goes in the initial table definition, but if the table exists:
-- ALTER TABLE org.business_profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- 2. Update the Create Business RPC
CREATE OR REPLACE FUNCTION org.create_business(
  payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, org, finance, auth
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_new_business_id uuid;
  v_slug text;
  _id uuid;
BEGIN
  -- A. Validation
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_slug := payload->>'slug';
  
  -- Check slug uniqueness
  IF EXISTS (SELECT 1 FROM org.business_profiles WHERE slug = v_slug) THEN
    RAISE EXCEPTION 'Business handle already taken' USING ERRCODE = '23505';
  END IF;

  -- Allow pre-generated ID for file upload paths
  _id := COALESCE((payload->>'id')::uuid, gen_random_uuid());

  -- B. Insert Business Profile
  INSERT INTO org.business_profiles (
    id,
    owner_user_id,
    name,
    slug,
    headline,
    bio, -- Mapped from description
    logo_url,
    banner_url, -- NEW
    legal_name,
    billing_email,
    country,
    address_line_1,
    address_city,
    address_zip,
    tax_id,
    default_currency
  ) VALUES (
    _id,
    v_user_id,
    payload->>'name',
    v_slug,
    COALESCE(payload->>'headline', ''),
    COALESCE(payload->'description', '{}'::jsonb),
    payload->>'logo_url',
    payload->>'banner_url', -- NEW
    payload->>'legal_name',
    payload->>'billing_email',
    payload->>'country',
    payload->>'address_line_1',
    payload->>'address_city',
    payload->>'address_zip',
    payload->>'tax_id',
    COALESCE(payload->>'default_currency', 'USD')
  )
  RETURNING id INTO v_new_business_id;

  -- C. Add Owner to Memberships
  INSERT INTO org.business_memberships (
    business_id,
    user_id,
    role,
    status
  ) VALUES (
    v_new_business_id,
    v_user_id,
    'owner',
    'active'
  );

  -- D. Initialize Wallet
  INSERT INTO finance.wallets (
    owner_type,
    owner_id,
    currency,
    balance_cents
  ) VALUES (
    'business',
    v_new_business_id,
    COALESCE(payload->>'default_currency', 'USD'),
    0
  );

  -- E. Switch Context
  INSERT INTO security.session_context (
    user_id, 
    active_profile_type, 
    active_profile_id, 
    updated_at
  )
  VALUES (v_user_id, 'business', v_new_business_id, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    active_profile_type = 'business',
    active_profile_id = v_new_business_id,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'business_id', v_new_business_id,
    'slug', v_slug
  );
END;
$$;