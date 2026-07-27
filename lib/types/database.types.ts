export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          candidate_id: string
          consent_given: boolean
          created_at: string
          cv_storage_path: string | null
          id: string
          job_id: string
          org_id: string
          source: Database["public"]["Enums"]["app_source"]
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          consent_given?: boolean
          created_at?: string
          cv_storage_path?: string | null
          id?: string
          job_id: string
          org_id: string
          source?: Database["public"]["Enums"]["app_source"]
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          consent_given?: boolean
          created_at?: string
          cv_storage_path?: string | null
          id?: string
          job_id?: string
          org_id?: string
          source?: Database["public"]["Enums"]["app_source"]
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          org_id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          org_id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          org_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_analyses: {
        Row: {
          application_id: string
          created_at: string
          extracted: Json | null
          gaps: Json | null
          id: string
          match_score: number | null
          model: string | null
          org_id: string
          strengths: Json | null
          verdict: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          extracted?: Json | null
          gaps?: Json | null
          id?: string
          match_score?: number | null
          model?: string | null
          org_id: string
          strengths?: Json | null
          verdict?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          extracted?: Json | null
          gaps?: Json | null
          id?: string
          match_score?: number | null
          model?: string | null
          org_id?: string
          strengths?: Json | null
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_analyses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_analyses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          application_id: string
          created_at: string
          cv_score: number | null
          decided_by: string | null
          decision: string | null
          final_score: number | null
          id: string
          interview_score: number | null
          is_shortlisted: boolean | null
          org_id: string
          rank: number | null
        }
        Insert: {
          application_id: string
          created_at?: string
          cv_score?: number | null
          decided_by?: string | null
          decision?: string | null
          final_score?: number | null
          id?: string
          interview_score?: number | null
          is_shortlisted?: boolean | null
          org_id: string
          rank?: number | null
        }
        Update: {
          application_id?: string
          created_at?: string
          cv_score?: number | null
          decided_by?: string | null
          decision?: string | null
          final_score?: number | null
          id?: string
          interview_score?: number | null
          is_shortlisted?: boolean | null
          org_id?: string
          rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string
          id: string
          org_id: string
          overall_score: number | null
          recording_url: string | null
          scores: Json | null
          status: string | null
          transcript: string | null
          vapi_call_id: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          org_id: string
          overall_score?: number | null
          recording_url?: string | null
          scores?: Json | null
          status?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          org_id?: string
          overall_score?: number | null
          recording_url?: string | null
          scores?: Json | null
          status?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_settings: {
        Row: {
          education_level: string | null
          interview_enabled: boolean | null
          interview_language: string | null
          interview_max_minutes: number | null
          interview_pass_threshold: number | null
          interview_questions: Json | null
          interview_voice: string | null
          job_id: string
          knockout_rules: Json | null
          languages: string[] | null
          min_experience_years: number | null
          nice_to_have_skills: string[] | null
          org_id: string
          pass_threshold: number | null
          ranking_weights: Json | null
          reject_threshold: number | null
          require_manual_call_approval: boolean | null
          required_skills: string[] | null
          scoring_weights: Json | null
          shortlist_size: number | null
          updated_at: string
        }
        Insert: {
          education_level?: string | null
          interview_enabled?: boolean | null
          interview_language?: string | null
          interview_max_minutes?: number | null
          interview_pass_threshold?: number | null
          interview_questions?: Json | null
          interview_voice?: string | null
          job_id: string
          knockout_rules?: Json | null
          languages?: string[] | null
          min_experience_years?: number | null
          nice_to_have_skills?: string[] | null
          org_id: string
          pass_threshold?: number | null
          ranking_weights?: Json | null
          reject_threshold?: number | null
          require_manual_call_approval?: boolean | null
          required_skills?: string[] | null
          scoring_weights?: Json | null
          shortlist_size?: number | null
          updated_at?: string
        }
        Update: {
          education_level?: string | null
          interview_enabled?: boolean | null
          interview_language?: string | null
          interview_max_minutes?: number | null
          interview_pass_threshold?: number | null
          interview_questions?: Json | null
          interview_voice?: string | null
          job_id?: string
          knockout_rules?: Json | null
          languages?: string[] | null
          min_experience_years?: number | null
          nice_to_have_skills?: string[] | null
          org_id?: string
          pass_threshold?: number | null
          ranking_weights?: Json | null
          reject_threshold?: number | null
          require_manual_call_approval?: boolean | null
          required_skills?: string[] | null
          scoring_weights?: Json | null
          shortlist_size?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_settings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          employment_type: string | null
          id: string
          location: string | null
          org_id: string
          seniority: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          org_id: string
          seniority?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          org_id?: string
          seniority?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: { Args: { target_org: string }; Returns: boolean }
      uuid_generate_v4: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "owner" | "admin" | "recruiter" | "viewer"
      app_source: "web_form" | "email" | "linkedin" | "manual"
      app_status:
        | "new"
        | "analyzing"
        | "analyzed"
        | "potential"
        | "irrelevant"
        | "review"
        | "interview_pending"
        | "interviewed"
        | "shortlisted"
        | "rejected"
        | "hired"
      job_status: "draft" | "published" | "paused" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "recruiter", "viewer"],
      app_source: ["web_form", "email", "linkedin", "manual"],
      app_status: [
        "new",
        "analyzing",
        "analyzed",
        "potential",
        "irrelevant",
        "review",
        "interview_pending",
        "interviewed",
        "shortlisted",
        "rejected",
        "hired",
      ],
      job_status: ["draft", "published", "paused", "closed"],
    },
  },
} as const
