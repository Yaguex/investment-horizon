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
      macro_data: {
        Row: {
          date: string | null
          id: number
          last_update: string | null
          series_id: string | null
          series_id_description: string | null
          value: number | null
        }
        Insert: {
          date?: string | null
          id?: number
          last_update?: string | null
          series_id?: string | null
          series_id_description?: string | null
          value?: number | null
        }
        Update: {
          date?: string | null
          id?: number
          last_update?: string | null
          series_id?: string | null
          series_id_description?: string | null
          value?: number | null
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
        Args: {
          profile_id_param: string
        }
        Returns: undefined
      }
      recalculate_allocations: {
        Args: {
          profile_id_param: string
        }
        Returns: undefined
      }
      recalculate_portfolio_data: {
        Args: {
          edited_month: string
          profile_id_param: string
        }
        Returns: undefined
      }
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
