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
      allocations: {
        Row: {
          bucket: string | null
          bucket_id: number | null
          delta: number | null
          "dividend_%": number | null
          dividend_$: number | null
          id: number
          portfolio_id: number | null
          profile_id: string | null
          risk_profile: string | null
          row_type: string | null
          value_actual: number | null
          value_target: number | null
          vehicle: string | null
          weight_actual: number | null
          weight_target: number | null
        }
        Insert: {
          bucket?: string | null
          bucket_id?: number | null
          delta?: number | null
          "dividend_%"?: number | null
          dividend_$?: number | null
          id: number
          portfolio_id?: number | null
          profile_id?: string | null
          risk_profile?: string | null
          row_type?: string | null
          value_actual?: number | null
          value_target?: number | null
          vehicle?: string | null
          weight_actual?: number | null
          weight_target?: number | null
        }
        Update: {
          bucket?: string | null
          bucket_id?: number | null
          delta?: number | null
          "dividend_%"?: number | null
          dividend_$?: number | null
          id?: number
          portfolio_id?: number | null
          profile_id?: string | null
          risk_profile?: string | null
          row_type?: string | null
          value_actual?: number | null
          value_target?: number | null
          vehicle?: string | null
          weight_actual?: number | null
          weight_target?: number | null
        }
        Relationships: []
      }
      diy_dividend: {
        Row: {
          bond_yield: number | null
          dividend_yield: number | null
          expiration: string | null
          id: number
          nominal: number | null
          profile_id: string | null
          strike_call: number | null
          strike_call_delta: number | null
          strike_call_extrinsic_value: number | null
          strike_call_intrinsic_value: number | null
          strike_call_iv: number | null
          strike_call_mid: number | null
          strike_call_open_interest: number | null
          strike_put: number | null
          strike_put_delta: number | null
          strike_put_extrinsic_value: number | null
          strike_put_intrinsic_value: number | null
          strike_put_iv: number | null
          strike_put_mid: number | null
          strike_put_open_interest: number | null
          ticker: string | null
          underlying_price: number | null
          wiggle: number | null
        }
        Insert: {
          bond_yield?: number | null
          dividend_yield?: number | null
          expiration?: string | null
          id?: number
          nominal?: number | null
          profile_id?: string | null
          strike_call?: number | null
          strike_call_delta?: number | null
          strike_call_extrinsic_value?: number | null
          strike_call_intrinsic_value?: number | null
          strike_call_iv?: number | null
          strike_call_mid?: number | null
          strike_call_open_interest?: number | null
          strike_put?: number | null
          strike_put_delta?: number | null
          strike_put_extrinsic_value?: number | null
          strike_put_intrinsic_value?: number | null
          strike_put_iv?: number | null
          strike_put_mid?: number | null
          strike_put_open_interest?: number | null
          ticker?: string | null
          underlying_price?: number | null
          wiggle?: number | null
        }
        Update: {
          bond_yield?: number | null
          dividend_yield?: number | null
          expiration?: string | null
          id?: number
          nominal?: number | null
          profile_id?: string | null
          strike_call?: number | null
          strike_call_delta?: number | null
          strike_call_extrinsic_value?: number | null
          strike_call_intrinsic_value?: number | null
          strike_call_iv?: number | null
          strike_call_mid?: number | null
          strike_call_open_interest?: number | null
          strike_put?: number | null
          strike_put_delta?: number | null
          strike_put_extrinsic_value?: number | null
          strike_put_intrinsic_value?: number | null
          strike_put_iv?: number | null
          strike_put_mid?: number | null
          strike_put_open_interest?: number | null
          ticker?: string | null
          underlying_price?: number | null
          wiggle?: number | null
        }
        Relationships: []
      }
      diy_notes: {
        Row: {
          bond_yield: number | null
          dividend_yield: number | null
          expiration: string | null
          id: number
          nominal: number | null
          profile_id: string | null
          strike_entry: number | null
          strike_entry_delta: number | null
          strike_entry_extrinsic_value: number | null
          strike_entry_intrinsic_value: number | null
          strike_entry_iv: number | null
          strike_entry_mid: number | null
          strike_entry_open_interest: number | null
          strike_protection: number | null
          strike_protection_delta: number | null
          strike_protection_extrinsic_value: number | null
          strike_protection_intrinsic_value: number | null
          strike_protection_iv: number | null
          strike_protection_mid: number | null
          strike_protection_open_interest: number | null
          strike_target: number | null
          strike_target_delta: number | null
          strike_target_extrinsic_value: number | null
          strike_target_intrinsic_value: number | null
          strike_target_iv: number | null
          strike_target_mid: number | null
          strike_target_open_interest: number | null
          ticker: string | null
          underlying_price: number | null
          wiggle: number | null
        }
        Insert: {
          bond_yield?: number | null
          dividend_yield?: number | null
          expiration?: string | null
          id?: number
          nominal?: number | null
          profile_id?: string | null
          strike_entry?: number | null
          strike_entry_delta?: number | null
          strike_entry_extrinsic_value?: number | null
          strike_entry_intrinsic_value?: number | null
          strike_entry_iv?: number | null
          strike_entry_mid?: number | null
          strike_entry_open_interest?: number | null
          strike_protection?: number | null
          strike_protection_delta?: number | null
          strike_protection_extrinsic_value?: number | null
          strike_protection_intrinsic_value?: number | null
          strike_protection_iv?: number | null
          strike_protection_mid?: number | null
          strike_protection_open_interest?: number | null
          strike_target?: number | null
          strike_target_delta?: number | null
          strike_target_extrinsic_value?: number | null
          strike_target_intrinsic_value?: number | null
          strike_target_iv?: number | null
          strike_target_mid?: number | null
          strike_target_open_interest?: number | null
          ticker?: string | null
          underlying_price?: number | null
          wiggle?: number | null
        }
        Update: {
          bond_yield?: number | null
          dividend_yield?: number | null
          expiration?: string | null
          id?: number
          nominal?: number | null
          profile_id?: string | null
          strike_entry?: number | null
          strike_entry_delta?: number | null
          strike_entry_extrinsic_value?: number | null
          strike_entry_intrinsic_value?: number | null
          strike_entry_iv?: number | null
          strike_entry_mid?: number | null
          strike_entry_open_interest?: number | null
          strike_protection?: number | null
          strike_protection_delta?: number | null
          strike_protection_extrinsic_value?: number | null
          strike_protection_intrinsic_value?: number | null
          strike_protection_iv?: number | null
          strike_protection_mid?: number | null
          strike_protection_open_interest?: number | null
          strike_target?: number | null
          strike_target_delta?: number | null
          strike_target_extrinsic_value?: number | null
          strike_target_intrinsic_value?: number | null
          strike_target_iv?: number | null
          strike_target_mid?: number | null
          strike_target_open_interest?: number | null
          ticker?: string | null
          underlying_price?: number | null
          wiggle?: number | null
        }
        Relationships: []
      }
      log_error: {
        Row: {
          event_message: string | null
          event_type: string | null
          function_id: string | null
          id: number
          id_1: string | null
          level: string | null
          timestamp: string | null
        }
        Insert: {
          event_message?: string | null
          event_type?: string | null
          function_id?: string | null
          id: number
          id_1?: string | null
          level?: string | null
          timestamp?: string | null
        }
        Update: {
          event_message?: string | null
          event_type?: string | null
          function_id?: string | null
          id?: number
          id_1?: string | null
          level?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      macro_data: {
        Row: {
          date: string | null
          id: number
          last_update: string | null
          series_id: string | null
          series_id_description: string | null
          value: number | null
          value_adjusted: number | null
        }
        Insert: {
          date?: string | null
          id?: number
          last_update?: string | null
          series_id?: string | null
          series_id_description?: string | null
          value?: number | null
          value_adjusted?: number | null
        }
        Update: {
          date?: string | null
          id?: number
          last_update?: string | null
          series_id?: string | null
          series_id_description?: string | null
          value?: number | null
          value_adjusted?: number | null
        }
        Relationships: []
      }
      macro_data_logs: {
        Row: {
          created_at: string
          id: number
          message: string | null
          series_id: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: never
          message?: string | null
          series_id: string
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: never
          message?: string | null
          series_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      option_expirations: {
        Row: {
          expirations: Json | null
          id: number
          last_updated: string | null
          ticker: string | null
        }
        Insert: {
          expirations?: Json | null
          id?: number
          last_updated?: string | null
          ticker?: string | null
        }
        Update: {
          expirations?: Json | null
          id?: number
          last_updated?: string | null
          ticker?: string | null
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
      position_size: {
        Row: {
          action: string | null
          bond_yield: number | null
          delta_entry: number | null
          delta_exit: number | null
          expiration: string | null
          id: number
          iv_entry: number | null
          iv_exit: number | null
          nominal: number | null
          premium_entry: number | null
          premium_exit: number | null
          profile_id: string | null
          strike_entry: number | null
          strike_exit: number | null
          ticker: string | null
          underlying_price_entry: number | null
        }
        Insert: {
          action?: string | null
          bond_yield?: number | null
          delta_entry?: number | null
          delta_exit?: number | null
          expiration?: string | null
          id?: number
          iv_entry?: number | null
          iv_exit?: number | null
          nominal?: number | null
          premium_entry?: number | null
          premium_exit?: number | null
          profile_id?: string | null
          strike_entry?: number | null
          strike_exit?: number | null
          ticker?: string | null
          underlying_price_entry?: number | null
        }
        Update: {
          action?: string | null
          bond_yield?: number | null
          delta_entry?: number | null
          delta_exit?: number | null
          expiration?: string | null
          id?: number
          iv_entry?: number | null
          iv_exit?: number | null
          nominal?: number | null
          premium_entry?: number | null
          premium_exit?: number | null
          profile_id?: string | null
          strike_entry?: number | null
          strike_exit?: number | null
          ticker?: string | null
          underlying_price_entry?: number | null
        }
        Relationships: []
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
      trade_log: {
        Row: {
          be_0: number | null
          be_1: number | null
          be_2: number | null
          commission: number | null
          date_entry: string | null
          date_exit: string | null
          date_expiration: string | null
          days_in_trade: number | null
          delta: number | null
          id: number
          iv: number | null
          iv_percentile: number | null
          notes: string | null
          order: string | null
          pnl: number | null
          portfolio_id: number | null
          premium: number | null
          profile_id: string | null
          qty: number | null
          "risk_%": number | null
          risk_$: number | null
          roi: number | null
          roi_portfolio: number | null
          roi_yearly: number | null
          row_type: string | null
          stock_price: number | null
          strike_end: number | null
          strike_start: number | null
          ticker: string | null
          trade_id: number | null
          trade_status: string | null
          vehicle: string | null
        }
        Insert: {
          be_0?: number | null
          be_1?: number | null
          be_2?: number | null
          commission?: number | null
          date_entry?: string | null
          date_exit?: string | null
          date_expiration?: string | null
          days_in_trade?: number | null
          delta?: number | null
          id: number
          iv?: number | null
          iv_percentile?: number | null
          notes?: string | null
          order?: string | null
          pnl?: number | null
          portfolio_id?: number | null
          premium?: number | null
          profile_id?: string | null
          qty?: number | null
          "risk_%"?: number | null
          risk_$?: number | null
          roi?: number | null
          roi_portfolio?: number | null
          roi_yearly?: number | null
          row_type?: string | null
          stock_price?: number | null
          strike_end?: number | null
          strike_start?: number | null
          ticker?: string | null
          trade_id?: number | null
          trade_status?: string | null
          vehicle?: string | null
        }
        Update: {
          be_0?: number | null
          be_1?: number | null
          be_2?: number | null
          commission?: number | null
          date_entry?: string | null
          date_exit?: string | null
          date_expiration?: string | null
          days_in_trade?: number | null
          delta?: number | null
          id?: number
          iv?: number | null
          iv_percentile?: number | null
          notes?: string | null
          order?: string | null
          pnl?: number | null
          portfolio_id?: number | null
          premium?: number | null
          profile_id?: string | null
          qty?: number | null
          "risk_%"?: number | null
          risk_$?: number | null
          roi?: number | null
          roi_portfolio?: number | null
          roi_yearly?: number | null
          row_type?: string | null
          stock_price?: number | null
          strike_end?: number | null
          strike_start?: number | null
          ticker?: string | null
          trade_id?: number | null
          trade_status?: string | null
          vehicle?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_portfolio_data_row: {
        Args: { profile_id_param: string }
        Returns: undefined
      }
      recalculate_allocations: {
        Args: { profile_id_param: string }
        Returns: undefined
      }
      recalculate_portfolio_data: {
        Args: { edited_month: string; profile_id_param: string }
        Returns: undefined
      }
      reset_macro_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      continents: [
        "Africa",
        "Antarctica",
        "Asia",
        "Europe",
        "Oceania",
        "North America",
        "South America",
      ],
    },
  },
} as const
