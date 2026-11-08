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
      admin_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: number
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: number
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: number
          target_user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          email_sent: boolean
          id: string
          ip_hash: string | null
          message: string
          name: string
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          email_sent?: boolean
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          email_sent?: boolean
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          topic?: string
        }
        Relationships: []
      }
      email_changes: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          new_email: string
          token_hash: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          new_email: string
          token_hash: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          new_email?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_changes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: number
          ip_hash: string
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          ip_hash: string
          success: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          ip_hash?: string
          success?: boolean
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          file_name: string
          height: number | null
          id: string
          mime: string
          owner_id: string
          path: string
          size_bytes: number
          width: number | null
        }
        Insert: {
          created_at?: string
          file_name: string
          height?: number | null
          id?: string
          mime: string
          owner_id: string
          path: string
          size_bytes: number
          width?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string
          height?: number | null
          id?: string
          mime?: string
          owner_id?: string
          path?: string
          size_bytes?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_notes: string | null
          brand_unlocked: boolean
          can_hide_powered_by: boolean
          created_at: string
          custom_domain: string | null
          id: string
          max_pages: number | null
          max_quizzes: number | null
          max_responses: number | null
          name: string
          plan: Database["public"]["Enums"]["plan_t"]
          role: Database["public"]["Enums"]["role_t"]
          status: Database["public"]["Enums"]["account_status_t"]
          suspended_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          brand_unlocked?: boolean
          can_hide_powered_by?: boolean
          created_at?: string
          custom_domain?: string | null
          id: string
          max_pages?: number | null
          max_quizzes?: number | null
          max_responses?: number | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_t"]
          role?: Database["public"]["Enums"]["role_t"]
          status?: Database["public"]["Enums"]["account_status_t"]
          suspended_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          brand_unlocked?: boolean
          can_hide_powered_by?: boolean
          created_at?: string
          custom_domain?: string | null
          id?: string
          max_pages?: number | null
          max_quizzes?: number | null
          max_responses?: number | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_t"]
          role?: Database["public"]["Enums"]["role_t"]
          status?: Database["public"]["Enums"]["account_status_t"]
          suspended_at?: string | null
        }
        Relationships: []
      }
      quiz_daily_stats: {
        Row: {
          day: string
          opened: number
          quiz_id: string
        }
        Insert: {
          day: string
          opened?: number
          quiz_id: string
        }
        Update: {
          day?: string
          opened?: number
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_daily_stats_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          accepting_responses: boolean
          created_at: string
          draft: Json
          draft_version: number
          finished_count: number
          hide_powered_by: boolean
          id: string
          name: string
          owner_id: string
          published: Json | null
          published_at: string | null
          published_version: number | null
          slug: string
          theme: Json | null
          updated_at: string
        }
        Insert: {
          accepting_responses?: boolean
          created_at?: string
          draft: Json
          draft_version?: number
          finished_count?: number
          hide_powered_by?: boolean
          id?: string
          name: string
          owner_id: string
          published?: Json | null
          published_at?: string | null
          published_version?: number | null
          slug: string
          theme?: Json | null
          updated_at?: string
        }
        Update: {
          accepting_responses?: boolean
          created_at?: string
          draft?: Json
          draft_version?: number
          finished_count?: number
          hide_powered_by?: boolean
          id?: string
          name?: string
          owner_id?: string
          published?: Json | null
          published_at?: string | null
          published_version?: number | null
          slug?: string
          theme?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          hits?: number
          key: string
          window_start: string
        }
        Update: {
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          answers: Json
          finished_at: string | null
          id: string
          last_page_id: string | null
          pages_seen: string[]
          quiz_id: string
          quiz_version: number
          started_at: string
          status: Database["public"]["Enums"]["response_status_t"]
          token_hash: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          finished_at?: string | null
          id?: string
          last_page_id?: string | null
          pages_seen?: string[]
          quiz_id: string
          quiz_version: number
          started_at?: string
          status?: Database["public"]["Enums"]["response_status_t"]
          token_hash: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          finished_at?: string | null
          id?: string
          last_page_id?: string | null
          pages_seen?: string[]
          quiz_id?: string
          quiz_version?: number
          started_at?: string
          status?: Database["public"]["Enums"]["response_status_t"]
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_holds: {
        Row: {
          expires_at: string
          owner_id: string
          slug: string
        }
        Insert: {
          expires_at: string
          owner_id: string
          slug: string
        }
        Update: {
          expires_at?: string
          owner_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "slug_holds_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finish_response: {
        Args: { p_response_id: string; p_token_hash: string }
        Returns: Json
      }
      publish_quiz: {
        Args: { p_base_version: number; p_quiz_id: string }
        Returns: Json
      }
      rate_limit_hit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      save_draft: {
        Args: { p_base_version: number; p_doc: Json; p_quiz_id: string }
        Returns: Json
      }
      slug_available: {
        Args: { p_quiz_id?: string; p_slug: string }
        Returns: Json
      }
      start_response: {
        Args: { p_slug: string; p_token_hash: string }
        Returns: Json
      }
      track_open: { Args: { p_quiz_id: string }; Returns: undefined }
    }
    Enums: {
      account_status_t: "active" | "suspended"
      plan_t: "free" | "custom"
      response_status_t: "in_progress" | "finished"
      role_t: "user" | "admin"
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
      account_status_t: ["active", "suspended"],
      plan_t: ["free", "custom"],
      response_status_t: ["in_progress", "finished"],
      role_t: ["user", "admin"],
    },
  },
} as const
