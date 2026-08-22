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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      agent_api_keys: {
        Row: {
          api_key_hash: string
          created_at: string | null
          id: string
          name: string | null
          permission: string | null
          store_id: string | null
        }
        Insert: {
          api_key_hash: string
          created_at?: string | null
          id?: string
          name?: string | null
          permission?: string | null
          store_id?: string | null
        }
        Update: {
          api_key_hash?: string
          created_at?: string | null
          id?: string
          name?: string | null
          permission?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_api_keys_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_jobs: {
        Row: {
          created_at: string | null
          id: string
          import_id: string | null
          input: Json | null
          job_type: string | null
          model: string | null
          output: Json | null
          status: string | null
          store_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          import_id?: string | null
          input?: Json | null
          job_type?: string | null
          model?: string | null
          output?: Json | null
          status?: string | null
          store_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          import_id?: string | null
          input?: Json | null
          job_type?: string | null
          model?: string | null
          output?: Json | null
          status?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_jobs_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_jobs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      imports: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          status: string | null
          store_id: string | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
          total_rows?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imports_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      knowledge_areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          slug: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          slug: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_areas_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assets: {
        Row: {
          asset_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          product_id: string
          url: string
          variant_id: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          url: string
          variant_id?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_assets_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          position: number | null
          product_id: string
          values: Json
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          position?: number | null
          product_id: string
          values?: Json
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          position?: number | null
          product_id?: string
          values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_semantics: {
        Row: {
          confidence: number | null
          created_at: string | null
          generated_by: string | null
          id: string
          product_id: string
          schema_id: string | null
          semantic_data: Json
          updated_at: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          product_id: string
          schema_id?: string | null
          semantic_data: Json
          updated_at?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          generated_by?: string | null
          id?: string
          product_id?: string
          schema_id?: string | null
          semantic_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_semantics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_semantics_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "semantic_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          inventory: number | null
          option_values: Json
          price: number | null
          product_id: string
          raw_data: Json | null
          semantic_data: Json | null
          sku: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          inventory?: number | null
          option_values?: Json
          price?: number | null
          product_id: string
          raw_data?: Json | null
          semantic_data?: Json | null
          sku?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          inventory?: number | null
          option_values?: Json
          price?: number | null
          product_id?: string
          raw_data?: Json | null
          semantic_data?: Json | null
          sku?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          inventory: number | null
          name: string
          price: number
          raw_data: Json | null
          semantic_data: Json | null
          sku: string | null
          status: string | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          inventory?: number | null
          name: string
          price: number
          raw_data?: Json | null
          semantic_data?: Json | null
          sku?: string | null
          status?: string | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          inventory?: number | null
          name?: string
          price?: number
          raw_data?: Json | null
          semantic_data?: Json | null
          sku?: string | null
          status?: string | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_fields: {
        Row: {
          aliases: Json | null
          created_at: string | null
          display_name: string
          field_name: string
          field_type: string
          id: string
          normalization_rules: Json | null
          required: boolean | null
          schema_id: string
          validation_rules: Json | null
        }
        Insert: {
          aliases?: Json | null
          created_at?: string | null
          display_name: string
          field_name: string
          field_type: string
          id?: string
          normalization_rules?: Json | null
          required?: boolean | null
          schema_id: string
          validation_rules?: Json | null
        }
        Update: {
          aliases?: Json | null
          created_at?: string | null
          display_name?: string
          field_name?: string
          field_type?: string
          id?: string
          normalization_rules?: Json | null
          required?: boolean | null
          schema_id?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_fields_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "semantic_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_rules: {
        Row: {
          conclusion: Json
          condition: Json
          confidence: number | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          name: string
        }
        Insert: {
          conclusion: Json
          condition: Json
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name: string
        }
        Update: {
          conclusion?: Json
          condition?: Json
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
        }
        Relationships: []
      }
      semantic_schemas: {
        Row: {
          created_at: string | null
          id: string
          industry_id: string | null
          schema: Json
          version: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry_id?: string | null
          schema: Json
          version?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry_id?: string | null
          schema?: Json
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_schemas_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      semantic_unknown_fields: {
        Row: {
          created_at: string | null
          id: string
          last_seen_at: string | null
          normalized_field_name: string | null
          occurrence_count: number | null
          product_id: string | null
          raw_field: string
          raw_value: Json | null
          reason: string | null
          schema_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          normalized_field_name?: string | null
          occurrence_count?: number | null
          product_id?: string | null
          raw_field: string
          raw_value?: Json | null
          reason?: string | null
          schema_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen_at?: string | null
          normalized_field_name?: string | null
          occurrence_count?: number | null
          product_id?: string | null
          raw_field?: string
          raw_value?: Json | null
          reason?: string | null
          schema_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_unknown_fields_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "semantic_unknown_fields_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "semantic_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      store_pages: {
        Row: {
          created_at: string | null
          id: string
          published: boolean | null
          sections: Json | null
          store_id: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          published?: boolean | null
          sections?: Json | null
          store_id: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          published?: boolean | null
          sections?: Json | null
          store_id?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_pages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      store_plugins: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          plugin_name: string
          store_id: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          plugin_name: string
          store_id?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          plugin_name?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_plugins_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          created_at: string | null
          id: string
          seo_config: Json | null
          store_id: string
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          seo_config?: Json | null
          store_id: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          seo_config?: Json | null
          store_id?: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          base_currency: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          industry_category: string | null
          industry_id: string | null
          logo_url: string | null
          owner_id: string
          status: string | null
          store_name: string
          store_slug: string
          updated_at: string | null
        }
        Insert: {
          base_currency?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          industry_category?: string | null
          industry_id?: string | null
          logo_url?: string | null
          owner_id: string
          status?: string | null
          store_name: string
          store_slug: string
          updated_at?: string | null
        }
        Update: {
          base_currency?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          industry_category?: string | null
          industry_id?: string | null
          logo_url?: string | null
          owner_id?: string
          status?: string | null
          store_name?: string
          store_slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          industry_id: string | null
          layout_config: Json
          name: string
          preview_url: string | null
          status: string | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id: string
          industry_id?: string | null
          layout_config: Json
          name: string
          preview_url?: string | null
          status?: string | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          industry_id?: string | null
          layout_config?: Json
          name?: string
          preview_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
