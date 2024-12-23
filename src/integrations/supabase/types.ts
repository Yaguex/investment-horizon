export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      monthly_portfolio_data: {
        Row: {
          balance: number | null
          flows: number | null
          id: number
          mom_gain: number | null
          mom_return: number | null
          month: string | null
          portfolio_id: number | null
          profile_id: string | null
          ytd_gain: number | null
          ytd_return: number | null
          "ytd-flows": number | null
        }
        Insert: {
          balance?: number | null
          flows?: number | null
          id?: number
          mom_gain?: number | null
          mom_return?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_gain?: number | null
          ytd_return?: number | null
          "ytd-flows"?: number | null
        }
        Update: {
          balance?: number | null
          flows?: number | null
          id?: number
          mom_gain?: number | null
          mom_return?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_gain?: number | null
          ytd_return?: number | null
          "ytd-flows"?: number | null
        }
        Relationships: []
      }
      portfolio_data: {
        Row: {
          balance: number | null
          flows: number | null
          id: number
          mom_gain: number | null
          mom_return: number | null
          mom_return_accumulated: number | null
          month: string | null
          portfolio_id: number | null
          profile_id: string | null
          ytd_flows: number | null
          ytd_gain: number | null
          ytd_return: number | null
        }
        Insert: {
          balance?: number | null
          flows?: number | null
          id: number
          mom_gain?: number | null
          mom_return?: number | null
          mom_return_accumulated?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_flows?: number | null
          ytd_gain?: number | null
          ytd_return?: number | null
        }
        Update: {
          balance?: number | null
          flows?: number | null
          id?: number
          mom_gain?: number | null
          mom_return?: number | null
          mom_return_accumulated?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_flows?: number | null
          ytd_gain?: number | null
          ytd_return?: number | null
        }
        Relationships: []
      }
      portfolio_data_2: {
        Row: {
          accumulated_mom_return: number | null
          balance: number | null
          flows: number | null
          id: number
          mom_gain: number | null
          mom_return: number | null
          month: string | null
          portfolio_id: number | null
          profile_id: string | null
          ytd_flows: number | null
          ytd_gain: number | null
          ytd_return: number | null
        }
        Insert: {
          accumulated_mom_return?: number | null
          balance?: number | null
          flows?: number | null
          id: number
          mom_gain?: number | null
          mom_return?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_flows?: number | null
          ytd_gain?: number | null
          ytd_return?: number | null
        }
        Update: {
          accumulated_mom_return?: number | null
          balance?: number | null
          flows?: number | null
          id?: number
          mom_gain?: number | null
          mom_return?: number | null
          month?: string | null
          portfolio_id?: number | null
          profile_id?: string | null
          ytd_flows?: number | null
          ytd_gain?: number | null
          ytd_return?: number | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: number
          name: string
          user_id: string
        }
        Insert: {
          id: number
          name?: string
          user_id: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
