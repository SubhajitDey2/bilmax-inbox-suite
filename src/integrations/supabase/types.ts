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
      campaign_queue: {
        Row: {
          attempts: number
          campaign_id: string
          created_at: string
          customer_id: string
          id: string
          last_error: string | null
          org_id: string
          scheduled_for: string
          sent_at: string | null
          status: Database["public"]["Enums"]["queue_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          campaign_id: string
          created_at?: string
          customer_id: string
          id?: string
          last_error?: string | null
          org_id: string
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          campaign_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          last_error?: string | null
          org_id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_queue_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_queue_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          customer_id: string
          error: string | null
          id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["recipient_status"]
        }
        Insert: {
          campaign_id: string
          customer_id: string
          error?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
        }
        Update: {
          campaign_id?: string
          customer_id?: string
          error?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["recipient_status"]
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          id: string
          name: string
          org_id: string
          updated_at: string
          variables: Json
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          name: string
          org_id: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "campaign_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience_filter: Json
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          created_by: string | null
          failed_count: number
          id: string
          name: string
          org_id: string
          scheduled_at: string | null
          sent_count: number
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          total_recipients: number
          updated_at: string
          whatsapp_template_id: string | null
        }
        Insert: {
          audience_filter?: Json
          channel: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          name: string
          org_id: string
          scheduled_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          total_recipients?: number
          updated_at?: string
          whatsapp_template_id?: string | null
        }
        Update: {
          audience_filter?: Json
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          created_by?: string | null
          failed_count?: number
          id?: string
          name?: string
          org_id?: string
          scheduled_at?: string | null
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          total_recipients?: number
          updated_at?: string
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_whatsapp_template_id_fkey"
            columns: ["whatsapp_template_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_connections: {
        Row: {
          channel: Database["public"]["Enums"]["channel_type"]
          config: Json
          created_at: string
          display_name: string
          external_account_id: string | null
          id: string
          last_synced_at: string | null
          org_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["channel_type"]
          config?: Json
          created_at?: string
          display_name: string
          external_account_id?: string | null
          id?: string
          last_synced_at?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel_type"]
          config?: Json
          created_at?: string
          display_name?: string
          external_account_id?: string | null
          id?: string
          last_synced_at?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          channel: Database["public"]["Enums"]["channel_type"]
          channel_thread_id: string | null
          chat_mode: Database["public"]["Enums"]["chat_mode"]
          created_at: string
          customer_id: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          org_id: string
          status: Database["public"]["Enums"]["conversation_status"]
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel: Database["public"]["Enums"]["channel_type"]
          channel_thread_id?: string | null
          chat_mode?: Database["public"]["Enums"]["chat_mode"]
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["conversation_status"]
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["channel_type"]
          channel_thread_id?: string | null
          chat_mode?: Database["public"]["Enums"]["chat_mode"]
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["conversation_status"]
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_services: {
        Row: {
          amount: number | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          org_id: string
          purchased_at: string
          service_name: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          org_id: string
          purchased_at?: string
          service_name: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          org_id?: string
          purchased_at?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_services_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_services_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          channel_handles: Json
          created_at: string
          dob: string | null
          email: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          last_booking_date: string | null
          last_payment_status:
            | Database["public"]["Enums"]["payment_status"]
            | null
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          address?: string | null
          channel_handles?: Json
          created_at?: string
          dob?: string | null
          email?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          last_booking_date?: string | null
          last_payment_status?:
            | Database["public"]["Enums"]["payment_status"]
            | null
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          address?: string | null
          channel_handles?: Json
          created_at?: string
          dob?: string | null
          email?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          last_booking_date?: string | null
          last_payment_status?:
            | Database["public"]["Enums"]["payment_status"]
            | null
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          body: string | null
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          error: string | null
          external_id: string | null
          id: string
          org_id: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id: string | null
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          attachments?: Json
          body?: string | null
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          error?: string | null
          external_id?: string | null
          id?: string
          org_id: string
          sender_type: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          attachments?: Json
          body?: string | null
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          error?: string | null
          external_id?: string | null
          id?: string
          org_id?: string
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
          sender_user_id?: string | null
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          plan: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          plan?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          plan?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_org_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_org_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_org_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_org_id_fkey"
            columns: ["default_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_accounts: {
        Row: {
          access_token_encrypted: string | null
          app_secret_encrypted: string | null
          connection_type: Database["public"]["Enums"]["whatsapp_connection_type"]
          created_at: string
          display_name: string
          id: string
          last_error: string | null
          last_synced_at: string | null
          meta_app_id: string | null
          org_id: string
          phone_number_id: string | null
          status: Database["public"]["Enums"]["whatsapp_connection_status"]
          updated_at: string
          webhook_url: string | null
          webhook_verify_token: string | null
          whatsapp_business_account_id: string | null
        }
        Insert: {
          access_token_encrypted?: string | null
          app_secret_encrypted?: string | null
          connection_type?: Database["public"]["Enums"]["whatsapp_connection_type"]
          created_at?: string
          display_name?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          meta_app_id?: string | null
          org_id: string
          phone_number_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_connection_status"]
          updated_at?: string
          webhook_url?: string | null
          webhook_verify_token?: string | null
          whatsapp_business_account_id?: string | null
        }
        Update: {
          access_token_encrypted?: string | null
          app_secret_encrypted?: string | null
          connection_type?: Database["public"]["Enums"]["whatsapp_connection_type"]
          created_at?: string
          display_name?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          meta_app_id?: string | null
          org_id?: string
          phone_number_id?: string | null
          status?: Database["public"]["Enums"]["whatsapp_connection_status"]
          updated_at?: string
          webhook_url?: string | null
          webhook_verify_token?: string | null
          whatsapp_business_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_templates: {
        Row: {
          approved_at: string | null
          body: string
          category: Database["public"]["Enums"]["template_category"]
          created_at: string
          created_by: string | null
          id: string
          language: string
          meta_template_id: string | null
          name: string
          org_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["template_status"]
          submitted_at: string | null
          updated_at: string
          variables: Json
        }
        Insert: {
          approved_at?: string | null
          body: string
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name: string
          org_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          submitted_at?: string | null
          updated_at?: string
          variables?: Json
        }
        Update: {
          approved_at?: string | null
          body?: string
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          id?: string
          language?: string
          meta_template_id?: string | null
          name?: string
          org_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["template_status"]
          submitted_at?: string | null
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_min_role: {
        Args: {
          _min: Database["public"]["Enums"]["app_role"]
          _org_id: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "agent" | "viewer" | "super_admin"
      campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "failed"
        | "cancelled"
        | "pending_approval"
        | "approved"
      channel_type: "whatsapp" | "instagram" | "facebook"
      chat_mode: "ai" | "human"
      connection_status: "disconnected" | "pending" | "connected" | "error"
      conversation_status: "open" | "snoozed" | "closed"
      gender: "male" | "female" | "other" | "prefer_not_to_say"
      message_direction: "inbound" | "outbound"
      message_sender_type: "customer" | "agent" | "ai" | "system"
      message_status: "queued" | "sent" | "delivered" | "read" | "failed"
      payment_status: "cash" | "upi" | "online" | "unpaid"
      queue_status: "pending" | "processing" | "sent" | "failed"
      recipient_status: "pending" | "sent" | "delivered" | "read" | "failed"
      template_category: "marketing" | "utility" | "authentication"
      template_status: "draft" | "pending" | "approved" | "rejected"
      whatsapp_connection_status:
        | "disconnected"
        | "pending"
        | "connected"
        | "error"
      whatsapp_connection_type: "cloud_api" | "coexistence"
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
      app_role: ["owner", "admin", "agent", "viewer", "super_admin"],
      campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "failed",
        "cancelled",
        "pending_approval",
        "approved",
      ],
      channel_type: ["whatsapp", "instagram", "facebook"],
      chat_mode: ["ai", "human"],
      connection_status: ["disconnected", "pending", "connected", "error"],
      conversation_status: ["open", "snoozed", "closed"],
      gender: ["male", "female", "other", "prefer_not_to_say"],
      message_direction: ["inbound", "outbound"],
      message_sender_type: ["customer", "agent", "ai", "system"],
      message_status: ["queued", "sent", "delivered", "read", "failed"],
      payment_status: ["cash", "upi", "online", "unpaid"],
      queue_status: ["pending", "processing", "sent", "failed"],
      recipient_status: ["pending", "sent", "delivered", "read", "failed"],
      template_category: ["marketing", "utility", "authentication"],
      template_status: ["draft", "pending", "approved", "rejected"],
      whatsapp_connection_status: [
        "disconnected",
        "pending",
        "connected",
        "error",
      ],
      whatsapp_connection_type: ["cloud_api", "coexistence"],
    },
  },
} as const
