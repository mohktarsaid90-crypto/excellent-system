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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_locations: {
        Row: {
          agent_id: string
          id: string
          latitude: number
          longitude: number
          recorded_at: string
        }
        Insert: {
          agent_id: string
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
        }
        Update: {
          agent_id?: string
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_locations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          can_add_clients: boolean | null
          can_give_discounts: boolean | null
          can_process_returns: boolean | null
          created_at: string
          current_sales: number | null
          email: string
          id: string
          is_active: boolean | null
          is_online: boolean | null
          last_location_lat: number | null
          last_location_lng: number | null
          last_seen_at: string | null
          monthly_target: number | null
          name: string
          password_hash: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          can_add_clients?: boolean | null
          can_give_discounts?: boolean | null
          can_process_returns?: boolean | null
          created_at?: string
          current_sales?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_seen_at?: string | null
          monthly_target?: number | null
          name: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          can_add_clients?: boolean | null
          can_give_discounts?: boolean | null
          can_process_returns?: boolean | null
          created_at?: string
          current_sales?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_seen_at?: string | null
          monthly_target?: number | null
          name?: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          assigned_agent_id: string | null
          city: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          email: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          assigned_agent_id?: string | null
          city?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          assigned_agent_id?: string | null
          city?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          invoice_id: string
          line_total: number
          product_id: string
          quantity: number
          unit_price: number
          vat_amount: number | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          invoice_id: string
          line_total: number
          product_id: string
          quantity: number
          unit_price: number
          vat_amount?: number | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          line_total?: number
          product_id?: string
          quantity?: number
          unit_price?: number
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          agent_id: string
          created_at: string
          customer_id: string
          discount_amount: number | null
          id: string
          invoice_number: string
          is_synced: boolean | null
          notes: string | null
          offline_created: boolean | null
          payment_method: string | null
          payment_status: string | null
          subtotal: number
          synced_at: string | null
          total_amount: number
          updated_at: string
          vat_amount: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          customer_id: string
          discount_amount?: number | null
          id?: string
          invoice_number: string
          is_synced?: boolean | null
          notes?: string | null
          offline_created?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal: number
          synced_at?: string | null
          total_amount: number
          updated_at?: string
          vat_amount?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          customer_id?: string
          discount_amount?: number | null
          id?: string
          invoice_number?: string
          is_synced?: boolean | null
          notes?: string | null
          offline_created?: boolean | null
          payment_method?: string | null
          payment_status?: string | null
          subtotal?: number
          synced_at?: string | null
          total_amount?: number
          updated_at?: string
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_plans: {
        Row: {
          agent_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          plan_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          plan_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          plan_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_plans_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stops: {
        Row: {
          check_in_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          check_out_at: string | null
          created_at: string
          customer_id: string
          id: string
          journey_plan_id: string
          notes: string | null
          status: string | null
          stop_order: number
        }
        Insert: {
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          journey_plan_id: string
          notes?: string | null
          status?: string | null
          stop_order: number
        }
        Update: {
          check_in_at?: string | null
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          journey_plan_id?: string
          notes?: string | null
          status?: string | null
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "journey_stops_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_stops_journey_plan_id_fkey"
            columns: ["journey_plan_id"]
            isOneToOne: false
            referencedRelation: "journey_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string
          id: string
          is_active: boolean | null
          min_stock_level: number | null
          name_ar: string
          name_en: string
          sku: string
          stock_quantity: number | null
          unit_price: number
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name_ar: string
          name_en: string
          sku: string
          stock_quantity?: number | null
          unit_price: number
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          min_stock_level?: number | null
          name_ar?: string
          name_en?: string
          sku?: string
          stock_quantity?: number | null
          unit_price?: number
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reconciliations: {
        Row: {
          agent_id: string
          approved_at: string | null
          approved_by: string | null
          cash_collected: number | null
          created_at: string
          date: string
          expected_cash: number | null
          id: string
          notes: string | null
          status: string | null
          submitted_at: string | null
          total_loaded: number | null
          total_returned: number | null
          total_sold: number | null
          variance: number | null
        }
        Insert: {
          agent_id: string
          approved_at?: string | null
          approved_by?: string | null
          cash_collected?: number | null
          created_at?: string
          date?: string
          expected_cash?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          total_loaded?: number | null
          total_returned?: number | null
          total_sold?: number | null
          variance?: number | null
        }
        Update: {
          agent_id?: string
          approved_at?: string | null
          approved_by?: string | null
          cash_collected?: number | null
          created_at?: string
          date?: string
          expected_cash?: number | null
          id?: string
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          total_loaded?: number | null
          total_returned?: number | null
          total_sold?: number | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_load_items: {
        Row: {
          approved_quantity: number | null
          created_at: string
          id: string
          product_id: string
          released_quantity: number | null
          requested_quantity: number
          stock_load_id: string
        }
        Insert: {
          approved_quantity?: number | null
          created_at?: string
          id?: string
          product_id: string
          released_quantity?: number | null
          requested_quantity: number
          stock_load_id: string
        }
        Update: {
          approved_quantity?: number | null
          created_at?: string
          id?: string
          product_id?: string
          released_quantity?: number | null
          requested_quantity?: number
          stock_load_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_load_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_load_items_stock_load_id_fkey"
            columns: ["stock_load_id"]
            isOneToOne: false
            referencedRelation: "stock_loads"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_loads: {
        Row: {
          agent_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          released_at: string | null
          released_by: string | null
          requested_at: string
          status: string | null
        }
        Insert: {
          agent_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          requested_at?: string
          status?: string | null
        }
        Update: {
          agent_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          released_at?: string | null
          released_by?: string | null
          requested_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_loads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      admin_role: "it_admin" | "sales_manager" | "accountant"
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
      admin_role: ["it_admin", "sales_manager", "accountant"],
    },
  },
} as const
