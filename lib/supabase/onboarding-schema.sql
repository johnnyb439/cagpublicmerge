-- User onboarding tracking table
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) CHECK (user_type IN ('job_seeker', 'employer')),
  current_step INTEGER DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}',
  profile_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add onboarding fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = user_id;
  
  -- Basic info (20%)
  IF user_record.first_name IS NOT NULL AND user_record.last_name IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF user_record.phone IS NOT NULL AND user_record.location IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Clearance info (30%)
  IF user_record.clearance_level IS NOT NULL THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF user_record.clearance_status IS NOT NULL THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Experience (20%)
  IF EXISTS (SELECT 1 FROM user_experience WHERE user_id = user_id LIMIT 1) THEN
    completion_score := completion_score + 20;
  END IF;
  
  -- Skills (20%)
  IF EXISTS (SELECT 1 FROM user_skills WHERE user_id = user_id LIMIT 1) THEN
    completion_score := completion_score + 20;
  END IF;
  
  -- Resume (10%)
  IF user_record.resume_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_completion
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- RLS Policies
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding data"
  ON user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
  ON user_onboarding FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(completed);

-- Function to check if user needs onboarding
CREATE OR REPLACE FUNCTION needs_onboarding(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  onboarding_exists BOOLEAN;
  onboarding_completed BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_onboarding 
    WHERE user_id = user_id AND completed = true
  ) INTO onboarding_completed;
  
  RETURN NOT onboarding_completed;
END;
$$ LANGUAGE plpgsql;