export type ClearanceLevel = 'None' | 'Public Trust' | 'Secret' | 'Top Secret' | 'TS/SCI'
export type UserRole = 'jobseeker' | 'employer' | 'admin'
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          first_name: string | null
          last_name: string | null
          phone: string | null
          clearance_level: ClearanceLevel
          clearance_verified: boolean
          clearance_expiry: string | null
          bio: string | null
          skills: string[] | null
          years_experience: number | null
          linkedin_url: string | null
          github_url: string | null
          mfa_enabled: boolean
          mfa_secret: string | null
          last_login: string | null
          login_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          website: string | null
          logo_url: string | null
          verified: boolean
          cage_code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string[] | null
          nice_to_haves: string[] | null
          location: string
          remote_allowed: boolean
          salary_min: number | null
          salary_max: number | null
          clearance_required: ClearanceLevel
          polygraph_required: boolean
          active: boolean
          posted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      applications: {
        Row: {
          id: string
          job_id: string
          user_id: string
          resume_url: string | null
          cover_letter: string | null
          status: ApplicationStatus
          submitted_at: string | null
          reviewed_at: string | null
          applicant_notes: string | null
          employer_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_url: string
          file_size: number | null
          mime_type: string | null
          version: number
          is_primary: boolean
          ai_score: number | null
          keywords_extracted: string[] | null
          analysis_data: any | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['resumes']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['resumes']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          old_data: any | null
          new_data: any | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          ip_address: string | null
          user_agent: string | null
          mfa_verified: boolean
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
    }
  }
}