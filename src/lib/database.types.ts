export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          onboarding_complete: boolean;
          reminder_email_enabled: boolean;
          privacy_analytics: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          onboarding_complete?: boolean;
          reminder_email_enabled?: boolean;
          privacy_analytics?: boolean;
        };
        Update: {
          display_name?: string | null;
          onboarding_complete?: boolean;
          reminder_email_enabled?: boolean;
          privacy_analytics?: boolean;
        };
      };
      decisions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          description: string | null;
          expected_outcome: string | null;
          confidence_level: number | null;
          urgency: string;
          people_involved: string | null;
          decision_date: string;
          follow_up_date: string | null;
          tags: string[];
          status: string;
          feeling_at_time: string | null;
          risk_score: number | null;
          reminder_sent_at: string | null;
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category?: string;
          description?: string | null;
          expected_outcome?: string | null;
          confidence_level?: number | null;
          urgency?: string;
          people_involved?: string | null;
          decision_date?: string;
          follow_up_date?: string | null;
          tags?: string[];
          status?: string;
          feeling_at_time?: string | null;
          risk_score?: number | null;
          reminder_sent_at?: string | null;
          ai_summary?: string | null;
        };
        Update: {
          title?: string;
          category?: string;
          description?: string | null;
          expected_outcome?: string | null;
          confidence_level?: number | null;
          urgency?: string;
          people_involved?: string | null;
          decision_date?: string;
          follow_up_date?: string | null;
          tags?: string[];
          status?: string;
          feeling_at_time?: string | null;
          risk_score?: number | null;
          reminder_sent_at?: string | null;
          ai_summary?: string | null;
        };
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string;
          worked_out: string;
          how_feel_now: string | null;
          what_changed: string | null;
          would_repeat: boolean | null;
          free_notes: string | null;
          sentiment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          decision_id: string;
          worked_out: string;
          how_feel_now?: string | null;
          what_changed?: string | null;
          would_repeat?: boolean | null;
          free_notes?: string | null;
          sentiment?: string | null;
        };
        Update: {
          worked_out?: string;
          how_feel_now?: string | null;
          what_changed?: string | null;
          would_repeat?: boolean | null;
          free_notes?: string | null;
          sentiment?: string | null;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          decision_id: string | null;
          insight_type: string;
          title: string;
          content: string;
          why_matters: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          decision_id?: string | null;
          insight_type: string;
          title: string;
          content: string;
          why_matters?: string | null;
          metadata?: Json;
        };
        Update: {
          insight_type?: string;
          title?: string;
          content?: string;
          why_matters?: string | null;
          metadata?: Json;
        };
      };
    };
  };
}

