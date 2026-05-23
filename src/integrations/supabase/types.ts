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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          actor_type: Database["public"]["Enums"]["audit_actor_type"]
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["audit_actor_type"]
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          actor_type?: Database["public"]["Enums"]["audit_actor_type"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      balances: {
        Row: {
          amount: number
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          market_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          market_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          market_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_ranges: {
        Row: {
          created_at: string
          current_price: number | null
          id: string
          label: string
          lower_bound: number
          market_id: string
          open_interest: number | null
          payoff_curve: Json | null
          status: string
          total_volume: number | null
          updated_at: string
          upper_bound: number
          volume_24h: number | null
        }
        Insert: {
          created_at?: string
          current_price?: number | null
          id?: string
          label: string
          lower_bound: number
          market_id: string
          open_interest?: number | null
          payoff_curve?: Json | null
          status?: string
          total_volume?: number | null
          updated_at?: string
          upper_bound: number
          volume_24h?: number | null
        }
        Update: {
          created_at?: string
          current_price?: number | null
          id?: string
          label?: string
          lower_bound?: number
          market_id?: string
          open_interest?: number | null
          payoff_curve?: Json | null
          status?: string
          total_volume?: number | null
          updated_at?: string
          upper_bound?: number
          volume_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_ranges_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          category: string
          ceiling_payout: number
          created_at: string
          created_by: string | null
          current_reference_value: number | null
          description: string | null
          final_observed_value: number | null
          final_payout_value: number | null
          floor_payout: number
          id: string
          lower_bound: number
          metric_name: string
          onchain_market_id: number | null
          resolution_date: string
          settlement_source: string
          settlement_url: string | null
          status: Database["public"]["Enums"]["market_status"]
          title: string
          unit: string
          updated_at: string
          upper_bound: number
        }
        Insert: {
          category?: string
          ceiling_payout?: number
          created_at?: string
          created_by?: string | null
          current_reference_value?: number | null
          description?: string | null
          final_observed_value?: number | null
          final_payout_value?: number | null
          floor_payout?: number
          id?: string
          lower_bound: number
          metric_name: string
          onchain_market_id?: number | null
          resolution_date: string
          settlement_source: string
          settlement_url?: string | null
          status?: Database["public"]["Enums"]["market_status"]
          title: string
          unit?: string
          updated_at?: string
          upper_bound: number
        }
        Update: {
          category?: string
          ceiling_payout?: number
          created_at?: string
          created_by?: string | null
          current_reference_value?: number | null
          description?: string | null
          final_observed_value?: number | null
          final_payout_value?: number | null
          floor_payout?: number
          id?: string
          lower_bound?: number
          metric_name?: string
          onchain_market_id?: number | null
          resolution_date?: string
          settlement_source?: string
          settlement_url?: string | null
          status?: Database["public"]["Enums"]["market_status"]
          title?: string
          unit?: string
          updated_at?: string
          upper_bound?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          market_id: string | null
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          market_id?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          filled_quantity: number
          id: string
          market_id: string
          order_type: Database["public"]["Enums"]["order_type"]
          price: number
          quantity: number
          side: Database["public"]["Enums"]["order_side"]
          status: Database["public"]["Enums"]["order_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          filled_quantity?: number
          id?: string
          market_id: string
          order_type?: Database["public"]["Enums"]["order_type"]
          price: number
          quantity: number
          side: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["order_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          filled_quantity?: number
          id?: string
          market_id?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          price?: number
          quantity?: number
          side?: Database["public"]["Enums"]["order_side"]
          status?: Database["public"]["Enums"]["order_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          average_price: number
          estimated_pnl: number
          id: string
          market_id: string
          net_quantity: number
          realized_pnl: number
          status: Database["public"]["Enums"]["position_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          average_price?: number
          estimated_pnl?: number
          id?: string
          market_id: string
          net_quantity?: number
          realized_pnl?: number
          status?: Database["public"]["Enums"]["position_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          average_price?: number
          estimated_pnl?: number
          id?: string
          market_id?: string
          net_quantity?: number
          realized_pnl?: number
          status?: Database["public"]["Enums"]["position_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      resolutions: {
        Row: {
          id: string
          market_id: string
          observed_value: number
          resolution_notes: string | null
          resolved_at: string
          resolved_by: string | null
          settlement_source_used: string
        }
        Insert: {
          id?: string
          market_id: string
          observed_value: number
          resolution_notes?: string | null
          resolved_at?: string
          resolved_by?: string | null
          settlement_source_used: string
        }
        Update: {
          id?: string
          market_id?: string
          observed_value?: number
          resolution_notes?: string | null
          resolved_at?: string
          resolved_by?: string | null
          settlement_source_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolutions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          buy_order_id: string
          buyer_user_id: string
          executed_at: string
          id: string
          market_id: string
          price: number
          quantity: number
          sell_order_id: string
          seller_user_id: string
        }
        Insert: {
          buy_order_id: string
          buyer_user_id: string
          executed_at?: string
          id?: string
          market_id: string
          price: number
          quantity: number
          sell_order_id: string
          seller_user_id: string
        }
        Update: {
          buy_order_id?: string
          buyer_user_id?: string
          executed_at?: string
          id?: string
          market_id?: string
          price?: number
          quantity?: number
          sell_order_id?: string
          seller_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_buy_order_id_fkey"
            columns: ["buy_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_sell_order_id_fkey"
            columns: ["sell_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          method: string
          status: string
          tx_hash: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          method: string
          status?: string
          tx_hash?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          method?: string
          status?: string
          tx_hash?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string
        }
        Relationships: []
      }
      withdrawal_destinations: {
        Row: {
          created_at: string
          destination: string
          id: string
          label: string
          last_used_at: string
          method: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          label: string
          last_used_at?: string
          method: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          label?: string
          last_used_at?: string
          method?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_trades: {
        Row: {
          executed_at: string | null
          id: string | null
          market_id: string | null
          price: number | null
          quantity: number | null
        }
        Insert: {
          executed_at?: string | null
          id?: string | null
          market_id?: string | null
          price?: number | null
          quantity?: number | null
        }
        Update: {
          executed_at?: string | null
          id?: string | null
          market_id?: string | null
          price?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      adjust_balance: {
        Args: { p_currency: string; p_delta: number; p_user_id: string }
        Returns: undefined
      }
      approve_withdrawal: {
        Args: { p_external_ref?: string; p_tx_id: string }
        Returns: Json
      }
      cancel_order: { Args: { p_order_id: string }; Returns: Json }
      cancel_withdrawal: { Args: { p_tx_id: string }; Returns: Json }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_market_last_price: { Args: { p_market_id: string }; Returns: number }
      get_my_trades: {
        Args: { p_limit?: number; p_market_id?: string }
        Returns: {
          buy_order_id: string
          buyer_user_id: string
          executed_at: string
          id: string
          market_id: string
          price: number
          quantity: number
          sell_order_id: string
          seller_user_id: string
          side: string
        }[]
      }
      get_public_username: { Args: { _user_id: string }; Returns: string }
      get_wallet_summary: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      notify_user: {
        Args: {
          p_body?: string
          p_market_id?: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      place_order_and_match: {
        Args: {
          p_market_id: string
          p_order_type: Database["public"]["Enums"]["order_type"]
          p_price: number
          p_quantity: number
          p_side: Database["public"]["Enums"]["order_side"]
          p_user_id: string
        }
        Returns: Json
      }
      promote_overdue_markets: { Args: never; Returns: number }
      reject_withdrawal: {
        Args: { p_reason?: string; p_tx_id: string }
        Returns: Json
      }
      request_withdrawal: {
        Args: {
          p_amount: number
          p_currency: string
          p_destination: string
          p_method: string
        }
        Returns: Json
      }
      settle_market: { Args: { p_market_id: string }; Returns: Json }
      upsert_withdrawal_destination: {
        Args: { p_destination: string; p_label: string; p_method: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      audit_action:
        | "create"
        | "update"
        | "approve"
        | "resolve"
        | "invalidate"
        | "cancel"
        | "trade"
        | "order"
      audit_actor_type: "user" | "system" | "admin"
      market_status:
        | "draft"
        | "pending"
        | "active"
        | "resolved"
        | "invalidated"
        | "cancelled"
        | "pending_resolution"
      order_side: "buy" | "sell"
      order_status: "open" | "partial" | "filled" | "cancelled"
      order_type: "market" | "limit"
      position_status: "open" | "closed"
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
      app_role: ["admin", "moderator", "user"],
      audit_action: [
        "create",
        "update",
        "approve",
        "resolve",
        "invalidate",
        "cancel",
        "trade",
        "order",
      ],
      audit_actor_type: ["user", "system", "admin"],
      market_status: [
        "draft",
        "pending",
        "active",
        "resolved",
        "invalidated",
        "cancelled",
        "pending_resolution",
      ],
      order_side: ["buy", "sell"],
      order_status: ["open", "partial", "filled", "cancelled"],
      order_type: ["market", "limit"],
      position_status: ["open", "closed"],
    },
  },
} as const
