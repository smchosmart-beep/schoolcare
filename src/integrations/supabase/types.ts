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
      profiles: {
        Row: {
          approved: boolean | null
          created_at: string | null
          email: string
          id: string
          school_name: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          email: string
          id: string
          school_name?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          school_name?: string | null
        }
        Relationships: []
      }
      quick_input_presets: {
        Row: {
          created_at: string
          health_issue: string
          id: string
          label: string
          medication: string
          slot_number: number
          teacher_id: string
          treatment: string
        }
        Insert: {
          created_at?: string
          health_issue?: string
          id?: string
          label?: string
          medication?: string
          slot_number: number
          teacher_id: string
          treatment?: string
        }
        Update: {
          created_at?: string
          health_issue?: string
          id?: string
          label?: string
          medication?: string
          slot_number?: number
          teacher_id?: string
          treatment?: string
        }
        Relationships: []
      }
      self_treatment_options: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          teacher_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string
          health_issue: string | null
          id: string
          medication: string | null
          self_treatment_item: string | null
          status: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
          temperature: string | null
          treatment: string | null
          updated_at: string
          visit_type: string
          visited_at: string
        }
        Insert: {
          created_at?: string
          health_issue?: string | null
          id?: string
          medication?: string | null
          self_treatment_item?: string | null
          status?: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
          temperature?: string | null
          treatment?: string | null
          updated_at?: string
          visit_type?: string
          visited_at?: string
        }
        Update: {
          created_at?: string
          health_issue?: string | null
          id?: string
          medication?: string | null
          self_treatment_item?: string | null
          status?: string
          student_class?: string
          student_grade?: number
          student_name?: string
          student_number?: number
          teacher_id?: string
          temperature?: string | null
          treatment?: string | null
          updated_at?: string
          visit_type?: string
          visited_at?: string
        }
        Relationships: []
      }
      waiting_queue: {
        Row: {
          created_at: string
          id: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          student_class?: string
          student_grade?: number
          student_name?: string
          student_number?: number
          teacher_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_queue_decrypted: {
        Args: { p_teacher_id: string }
        Returns: {
          created_at: string
          id: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
        }[]
      }
      get_visits_decrypted: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_teacher_id: string
        }
        Returns: {
          created_at: string
          health_issue: string
          id: string
          medication: string
          self_treatment_item: string
          status: string
          student_class: string
          student_grade: number
          student_name: string
          student_number: number
          teacher_id: string
          temperature: string
          treatment: string
          updated_at: string
          visit_type: string
          visited_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      private_encryption_key: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "teacher"
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
      app_role: ["admin", "teacher"],
    },
  },
} as const
