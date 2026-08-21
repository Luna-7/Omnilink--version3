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
          industry_category: string | null
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
          industry_category?: string | null
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
          industry_category?: string | null
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
          raw_data: Json | null
          semantic_data: Json | null
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
          raw_data?: Json | null
          semantic_data?: Json | null
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
          raw_data?: Json | null
          semantic_data?: Json | null
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
      semantic_fields: {
        Row: {
          id: string
          schema_id: string
          field_name: string
          field_type: string
          display_name: string
          aliases: Json
          normalization_rules: Json
          required: boolean
          validation_rules: Json
          created_at: string
        }
        Insert: {
          id?: string
          schema_id: string
          field_name: string
          field_type: string
          display_name: string
          aliases?: Json
          normalization_rules?: Json
          required?: boolean
          validation_rules?: Json
          created_at?: string
        }
        Update: {
          id?: string
          schema_id?: string
          field_name?: string
          field_type?: string
          display_name?: string
          aliases?: Json
          normalization_rules?: Json
          required?: boolean
          validation_rules?: Json
          created_at?: string
        }
      }
      semantic_processing_logs: {
        Row: {
          id: string
          product_id: string
          schema_id: string | null
          processor_version: string
          status: string
          confidence: number | null
          error_message: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          schema_id?: string | null
          processor_version: string
          status: string
          confidence?: number | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          schema_id?: string | null
          processor_version?: string
          status?: string
          confidence?: number | null
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      semantic_ontology: {
        Row: {
          id: string
          canonical_name: string
          description: string | null
          industry: string | null
          aliases: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          canonical_name: string
          description?: string | null
          industry?: string | null
          aliases?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          canonical_name?: string
          description?: string | null
          industry?: string | null
          aliases?: Json
          created_at?: string
          updated_at?: string
        }
      }
      semantic_relations: {
        Row: {
          id: string
          source_concept_id: string
          relation_type: string
          target_concept_id: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          source_concept_id: string
          relation_type: string
          target_concept_id: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          source_concept_id?: string
          relation_type?: string
          target_concept_id?: string
          metadata?: Json
          created_at?: string
        }
      }
      semantic_rules: {
        Row: {
          id: string
          name: string
          description: string | null
          industry: string | null
          condition: Json
          conclusion: Json
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          industry?: string | null
          condition: Json
          conclusion: Json
          confidence?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          industry?: string | null
          condition?: Json
          conclusion?: Json
          confidence?: number
          created_at?: string
        }
      }
      semantic_candidates: {
        Row: {
          id: string
          candidate_name: string
          candidate_type: string
          confidence: number
          reason: string | null
          source: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_name: string
          candidate_type: string
          confidence?: number
          reason?: string | null
          source?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_name?: string
          candidate_type?: string
          confidence?: number
          reason?: string | null
          source?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      semantic_change_logs: {
        Row: {
          id: string
          candidate_id: string
          change_type: string
          before_state: Json
          after_state: Json
          operator: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          change_type: string
          before_state?: Json
          after_state?: Json
          operator?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          change_type?: string
          before_state?: Json
          after_state?: Json
          operator?: string
          status?: string
          created_at?: string
        }
      }
      semantic_memory: {
        Row: {
          id: string
          entity_type: string
          entity_id: string | null
          memory_type: string
          content: Json
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id?: string | null
          memory_type: string
          content: Json
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string | null
          memory_type?: string
          content?: Json
          source?: string
          created_at?: string
        }
      }
      semantic_queries: {
        Row: {
          id: string
          query_text: string
          parsed_result: Json
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          query_text: string
          parsed_result: Json
          confidence?: number
          created_at?: string
        }
        Update: {
          id?: string
          query_text?: string
          parsed_result?: Json
          confidence?: number
          created_at?: string
        }
      }
      semantic_query_events: {
        Row: {
          id: string
          query_text: string
          parsed_intent: string | null
          matched_product_ids: Json
          matched_concepts: Json
          confidence: number
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          query_text: string
          parsed_intent?: string | null
          matched_product_ids?: Json
          matched_concepts?: Json
          confidence?: number
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          query_text?: string
          parsed_intent?: string | null
          matched_product_ids?: Json
          matched_concepts?: Json
          confidence?: number
          source?: string
          created_at?: string
        }
      }
      semantic_evidence: {
        Row: {
          id: string
          product_id: string
          semantic_field: string
          field_value: Json
          evidence_type: string
          evidence_source: string
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          semantic_field: string
          field_value: Json
          evidence_type: string
          evidence_source: string
          confidence?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          semantic_field?: string
          field_value?: Json
          evidence_type?: string
          evidence_source?: string
          confidence?: number
          created_at?: string
        }
      }
      semantic_unknown_fields: {
        Row: {
          id: string
          schema_id: string | null
          product_id: string
          raw_field: string
          raw_value: Json
          reason: string | null
          status: string
          normalized_field_name: string | null
          occurrence_count: number
          last_seen_at: string
          created_at: string
        }
        Insert: {
          id?: string
          schema_id?: string | null
          product_id: string
          raw_field: string
          raw_value?: Json
          reason?: string | null
          status?: string
          normalized_field_name?: string | null
          occurrence_count?: number
          last_seen_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          schema_id?: string | null
          product_id?: string
          raw_field?: string
          raw_value?: Json
          reason?: string | null
          status?: string
          normalized_field_name?: string | null
          occurrence_count?: number
          last_seen_at?: string
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
          storage_key: string | null
          file_hash: string | null
          size_bytes: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          asset_type: string
          url: string
          storage_key?: string | null
          file_hash?: string | null
          size_bytes?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          asset_type?: string
          url?: string
          storage_key?: string | null
          file_hash?: string | null
          size_bytes?: number | null
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
