-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE clearance_level AS ENUM ('None', 'Public Trust', 'Secret', 'Top Secret', 'TS/SCI');
CREATE TYPE user_role AS ENUM ('jobseeker', 'employer', 'admin');
CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'interviewed', 'offered', 'rejected', 'withdrawn');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'jobseeker',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Security clearance info (encrypted)
  clearance_level clearance_level DEFAULT 'None',
  clearance_verified BOOLEAN DEFAULT false,
  clearance_expiry DATE,
  
  -- Profile
  bio TEXT,
  skills TEXT[],
  years_experience INTEGER,
  linkedin_url TEXT,
  github_url TEXT,
  
  -- Security
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT, -- Encrypted
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  cage_code TEXT, -- For government contractors
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Job details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  nice_to_haves TEXT[],
  
  -- Location
  location TEXT NOT NULL,
  remote_allowed BOOLEAN DEFAULT false,
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  
  -- Security requirements
  clearance_required clearance_level NOT NULL DEFAULT 'None',
  polygraph_required BOOLEAN DEFAULT false,
  
  -- Status
  active BOOLEAN DEFAULT true,
  posted_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Application data
  resume_url TEXT,
  cover_letter TEXT,
  status application_status DEFAULT 'draft',
  
  -- Tracking
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  applicant_notes TEXT,
  employer_notes TEXT, -- Only visible to employer
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(job_id, user_id)
);

-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- S3 URL
  file_size INTEGER,
  mime_type TEXT,
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,
  
  -- AI Analysis
  ai_score INTEGER,
  keywords_extracted TEXT[],
  analysis_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  -- Action details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Request info
  ip_address INET,
  user_agent TEXT,
  
  -- Data
  old_data JSONB,
  new_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for MFA and security)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session data
  token_hash TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Security
  mfa_verified BOOLEAN DEFAULT false,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_clearance ON users(clearance_level, clearance_verified);
CREATE INDEX idx_jobs_clearance ON jobs(clearance_required);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view active jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (active = true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own resumes
CREATE POLICY "Users can view own resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

-- Audit logs are append-only
CREATE POLICY "Audit logs are insert only" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Functions

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();