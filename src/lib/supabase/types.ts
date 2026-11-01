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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      action_guide_steps: {
        Row: {
          detail: string
          guide_id: string
          id: string
          link_label: string | null
          link_url: string | null
          step_order: number
          title: string
        }
        Insert: {
          detail: string
          guide_id: string
          id?: string
          link_label?: string | null
          link_url?: string | null
          step_order: number
          title: string
        }
        Update: {
          detail?: string
          guide_id?: string
          id?: string
          link_label?: string | null
          link_url?: string | null
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_guide_steps_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "action_guides"
            referencedColumns: ["id"]
          },
        ]
      }
      action_guides: {
        Row: {
          category_id: string | null
          id: string
          phase: Database["public"]["Enums"]["guide_phase"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          updated_at: string
          urgency: number | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          phase: Database["public"]["Enums"]["guide_phase"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          updated_at?: string
          urgency?: number | null
        }
        Update: {
          category_id?: string | null
          id?: string
          phase?: Database["public"]["Enums"]["guide_phase"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          updated_at?: string
          urgency?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "action_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "scam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          ai_result: Json | null
          category_slug: string | null
          created_at: string
          id: string
          input_excerpt: string | null
          input_kind: Database["public"]["Enums"]["input_kind"]
          model: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          rule_hits: Json
          user_id: string | null
        }
        Insert: {
          ai_result?: Json | null
          category_slug?: string | null
          created_at?: string
          id?: string
          input_excerpt?: string | null
          input_kind: Database["public"]["Enums"]["input_kind"]
          model?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number
          rule_hits?: Json
          user_id?: string | null
        }
        Update: {
          ai_result?: Json | null
          category_slug?: string | null
          created_at?: string
          id?: string
          input_excerpt?: string | null
          input_kind?: Database["public"]["Enums"]["input_kind"]
          model?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number
          rule_hits?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      attempt_answers: {
        Row: {
          attempt_id: string
          choice_id: string
          step_id: string
        }
        Insert: {
          attempt_id: string
          choice_id: string
          step_id: string
        }
        Update: {
          attempt_id?: string
          choice_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "scenario_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "scenario_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "scenario_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content_md: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content_md: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
        }
        Update: {
          author_id?: string | null
          content_md?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          body: string
          category_id: string | null
          created_at: string
          helpful_count: number
          id: string
          kind: Database["public"]["Enums"]["post_kind"]
          moderation_note: string | null
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          author_id: string
          body: string
          category_id?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          kind?: Database["public"]["Enums"]["post_kind"]
          moderation_note?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Update: {
          author_id?: string
          body?: string
          category_id?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          kind?: Database["public"]["Enums"]["post_kind"]
          moderation_note?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "scam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          last_active_date: string | null
          level: number
          role: Database["public"]["Enums"]["user_role"]
          save_history: boolean
          streak_count: number
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          last_active_date?: string | null
          level?: number
          role?: Database["public"]["Enums"]["user_role"]
          save_history?: boolean
          streak_count?: number
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_active_date?: string | null
          level?: number
          role?: Database["public"]["Enums"]["user_role"]
          save_history?: boolean
          streak_count?: number
          xp?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          bucket: string
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          bucket: string
          hits?: number
          key: string
          window_start: string
        }
        Update: {
          bucket?: string
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      red_flag_rules: {
        Row: {
          applies_to: Database["public"]["Enums"]["input_kind"][]
          category_id: string | null
          code: string
          explanation: string
          id: string
          is_active: boolean
          label: string
          pattern: string
          weight: number
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["input_kind"][]
          category_id?: string | null
          code: string
          explanation: string
          id?: string
          is_active?: boolean
          label: string
          pattern: string
          weight?: number
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["input_kind"][]
          category_id?: string | null
          code?: string
          explanation?: string
          id?: string
          is_active?: boolean
          label?: string
          pattern?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "red_flag_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "scam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      scam_categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      scenario_attempts: {
        Row: {
          completed_at: string
          id: string
          max_score: number
          scenario_id: string
          score: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          id?: string
          max_score: number
          scenario_id: string
          score: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          id?: string
          max_score?: number
          scenario_id?: string
          score?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenario_attempts_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_choices: {
        Row: {
          feedback: string
          id: string
          is_safe: boolean
          label: string
          next_step_id: string | null
          score_delta: number
          sort_order: number | null
          step_id: string
        }
        Insert: {
          feedback: string
          id?: string
          is_safe: boolean
          label: string
          next_step_id?: string | null
          score_delta?: number
          sort_order?: number | null
          step_id: string
        }
        Update: {
          feedback?: string
          id?: string
          is_safe?: boolean
          label?: string
          next_step_id?: string | null
          score_delta?: number
          sort_order?: number | null
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_choices_next_step_id_fkey"
            columns: ["next_step_id"]
            isOneToOne: false
            referencedRelation: "scenario_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_choices_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "scenario_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_steps: {
        Row: {
          channel: string | null
          id: string
          narrative: string
          scenario_id: string
          sender_name: string | null
          step_order: number
        }
        Insert: {
          channel?: string | null
          id?: string
          narrative: string
          scenario_id: string
          sender_name?: string | null
          step_order: number
        }
        Update: {
          channel?: string | null
          id?: string
          narrative?: string
          scenario_id?: string
          sender_name?: string | null
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenario_steps_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          is_ai_generated: boolean
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_ai_generated?: boolean
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_ai_generated?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "scam_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_checklist_progress: {
        Row: {
          done_at: string
          step_id: string
          user_id: string
        }
        Insert: {
          done_at?: string
          step_id: string
          user_id: string
        }
        Update: {
          done_at?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_checklist_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "action_guide_steps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          level: number | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          level?: number | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          id?: string | null
          level?: number | null
          xp?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      finish_scenario: {
        Args: { p_choice_ids: string[]; p_scenario_id: string }
        Returns: Json
      }
      get_choice_feedback: {
        Args: { p_choice_id: string }
        Returns: {
          feedback: string
          is_safe: boolean
          next_step_id: string
          score_delta: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      trending_categories: {
        Args: { p_days?: number }
        Returns: {
          category_slug: string
          total: number
        }[]
      }
    }
    Enums: {
      content_status: "draft" | "pending" | "published" | "rejected"
      difficulty_level: "mudah" | "sedang" | "sulit"
      guide_phase: "sebelum" | "sesudah"
      input_kind: "text" | "url" | "image" | "mixed"
      post_kind: "tips" | "pengalaman" | "peringatan"
      risk_level: "rendah" | "waspada" | "tinggi"
      user_role: "user" | "moderator" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      content_status: ["draft", "pending", "published", "rejected"],
      difficulty_level: ["mudah", "sedang", "sulit"],
      guide_phase: ["sebelum", "sesudah"],
      input_kind: ["text", "url", "image", "mixed"],
      post_kind: ["tips", "pengalaman", "peringatan"],
      risk_level: ["rendah", "waspada", "tinggi"],
      user_role: ["user", "moderator", "admin"],
    },
  },
} as const
