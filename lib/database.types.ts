// Database Types for Omnilink Schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      industries: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          owner_id: string
          store_name: string
          store_slug: string
          industry_id: string | null
          logo_url: string | null
          description: string | null
          currency: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          store_name: string
          store_slug: string
          industry_id?: string | null
          logo_url?: string | null
          description?: string | null
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          store_name?: string
          store_slug?: string
          industry_id?: string | null
          logo_url?: string | null
          description?: string | null
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      store_settings: {
        Row: {
          id: string
          store_id: string
          theme_config: Json
          seo_config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          theme_config?: Json
          seo_config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          theme_config?: Json
          seo_config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          author_id: string | null
          industry_id: string | null
          layout_config: Json
          preview_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          author_id?: string | null
          industry_id?: string | null
          layout_config: Json
          preview_url?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          author_id?: string | null
          industry_id?: string | null
          layout_config?: Json
          preview_url?: string | null
          status?: string
          created_at?: string
        }
      }
      store_pages: {
        Row: {
          id: string
          store_id: string
          template_id: string | null
          sections: Json
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          template_id?: string | null
          sections?: Json
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          template_id?: string | null
          sections?: Json
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          sku: string | null
          name: string
          description: string | null
          price: number
          currency: string
          inventory: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          sku?: string | null
          name: string
          description?: string | null
          price: number
          currency?: string
          inventory?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          sku?: string | null
          name?: string
          description?: string | null
          price?: number
          currency?: string
          inventory?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      semantic_schemas: {
        Row: {
          id: string
          industry_id: string | null
          version: string
          schema: Json
          created_at: string
        }
        Insert: {
          id?: string
          industry_id?: string | null
          version?: string
          schema: Json
          created_at?: string
        }
        Update: {
          id?: string
          industry_id?: string | null
          version?: string
          schema?: Json
          created_at?: string
        }
      }
      product_semantics: {
        Row: {
          id: string
          product_id: string
          schema_id: string | null
          semantic_data: Json
          confidence: number | null
          generated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          schema_id?: string | null
          semantic_data: Json
          confidence?: number | null
          generated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          schema_id?: string | null
          semantic_data?: Json
          confidence?: number | null
          generated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_assets: {
        Row: {
          id: string
          product_id: string
          asset_type: string
          url: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          asset_type: string
          url: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          asset_type?: string
          url?: string
          metadata?: Json
          created_at?: string
        }
      }
      imports: {
        Row: {
          id: string
          store_id: string | null
          file_url: string | null
          status: string | null
          total_rows: number | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id?: string | null
          file_url?: string | null
          status?: string | null
          total_rows?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string | null
          file_url?: string | null
          status?: string | null
          total_rows?: number | null
          created_at?: string
        }
      }
      ai_jobs: {
        Row: {
          id: string
          store_id: string | null
          import_id: string | null
          job_type: string | null
          status: string | null
          model: string | null
          input: Json | null
          output: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id?: string | null
          import_id?: string | null
          job_type?: string | null
          status?: string | null
          model?: string | null
          input?: Json | null
          output?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string | null
          import_id?: string | null
          job_type?: string | null
          status?: string | null
          model?: string | null
          input?: Json | null
          output?: Json | null
          created_at?: string
        }
      }
      store_plugins: {
        Row: {
          id: string
          store_id: string | null
          plugin_name: string
          enabled: boolean
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          store_id?: string | null
          plugin_name: string
          enabled?: boolean
          config?: Json
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string | null
          plugin_name?: string
          enabled?: boolean
          config?: Json
          created_at?: string
        }
      }
      agent_api_keys: {
        Row: {
          id: string
          store_id: string | null
          api_key_hash: string
          name: string | null
          permission: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id?: string | null
          api_key_hash: string
          name?: string | null
          permission?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string | null
          api_key_hash?: string
          name?: string | null
          permission?: string
          created_at?: string
        }
      }
    }
  }
}
