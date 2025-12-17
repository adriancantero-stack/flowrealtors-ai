export interface User {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    account_type: 'admin' | 'realtor';
    role: 'admin' | 'realtor' | 'broker';
    created_at: Date;
    onboarding_completed: boolean;
    preferred_language?: 'en' | 'es' | 'pt';
}

export interface Lead {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    email?: string;
    source: 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'youtube' | 'manual' | 'funnel_landing';
    status: 'new' | 'contacted' | 'qualified' | 'appointment_set' | 'negotiation' | 'closed' | 'lost';
    qualification_score: number;
    tags: string[];
    conversation_history: string[]; // JSON string or ID reference
    created_at: Date;

    // AI Qualification Fields
    intent?: string;
    budget?: string;
    timeline?: string;
    property_type?: string;
    urgency?: 'low' | 'medium' | 'high';
    recommended_action?: string;
    ai_summary?: string;
    extracted_data?: {
        budget?: string;
        timeline?: string;
        property_type?: string;
        [key: string]: any;
    };
    language?: 'en' | 'es' | 'pt';
}

export interface AutomationJob {
    id: string;
    user_id: string;
    lead_id: string;
    type: 'welcome' | 'pre_call' | 'reminder' | 'post_call' | 'reactivation';
    status: 'pending' | 'executed' | 'failed';
    scheduled_for: Date;
    payload?: any;
    language?: 'en' | 'es' | 'pt';
}

export interface AnalysisResult {
    intent: string;
    extracted_data: {
        budget: string | null;
        timeline: string | null;
        property_type: string | null;
        location: string | null;
        financing: string | null;
        urgency_level: 'low' | 'medium' | 'high';
        name?: string;
        email?: string;
        phone?: string;
        suggested_status?: string;
        bedrooms?: string;
        bathrooms?: string;
        condition?: string;
        location_priority?: string;
    };
    score: number;
    recommended_action: string;
    ai_summary: string;
}

export interface Integration {
    id: string;
    user_id: string;
    whatsapp_api_key?: string;
    meta_access_token?: string;
    tiktok_access_token?: string;
    youtube_key?: string;
}

export interface IntegrationWhatsApp {
    id: string;
    user_id: string;
    provider: '360dialog' | 'gupshup' | 'other';
    api_key: string;
    phone_number_id: string;
    webhook_url: string;
    status: 'connected' | 'disconnected';
    created_at: Date;
}

export interface IntegrationMeta {
    id: string;
    user_id: string;
    app_id: string;
    app_secret: string;
    page_id: string;
    access_token: string;
    webhook_url: string;
    status: 'connected' | 'disconnected';
    created_at: Date;
}

export interface IntegrationTikTok {
    id: string;
    user_id: string;
    app_id: string;
    app_secret: string;
    access_token: string;
    webhook_url: string;
    status: 'connected' | 'disconnected';
    created_at: Date;
}

export interface IntegrationYouTube {
    id: string;
    user_id: string;
    api_key: string;
    channel_id: string;
    webhook_url: string;
    status: 'connected' | 'disconnected';
    created_at: Date;
}

export interface IntegrationCalendar {
    id: string;
    user_id: string;
    provider: 'calendly' | 'google' | 'other';
    webhook_url: string;
    status: 'connected' | 'disconnected';
    created_at: Date;
}

export interface IntegrationAutomation {
    id: string;
    user_id: string;
    inbound_webhook_url: string;
    outbound_webhook_url?: string;
    send_new_leads: boolean;
    send_updates: boolean;
    send_hot_leads: boolean;
    send_meetings: boolean;
    created_at: Date;
}

export interface AutomationSettings {
    id: string;
    user_id: string;
    welcome_enabled: boolean;
    pre_call_enabled: boolean;
    reminder_enabled: boolean;
    post_call_enabled: boolean;
    reactivation_enabled: boolean;
    welcome_delay_minutes: number;
    reminder_before_minutes: number;
    reactivation_days: number;
    created_at: Date;
}

export interface AutomationJob {
    id: string;
    user_id: string;
    lead_id: string;
    type: 'welcome' | 'pre_call' | 'reminder' | 'post_call' | 'reactivation';
    scheduled_for: Date;
    payload?: any;
    status: 'pending' | 'executed' | 'failed';
}

export interface MessageLog {
    id: string;
    lead_name?: string; // Denormalized for easy display
    message_direction: 'inbound' | 'outbound';
    message_content: string;
    timestamp: Date;
}

export interface FunnelSettings {
    id: string;
    user_id: string;
    hero_title: string;
    hero_subtitle: string;
    target_area: string;
    primary_language: 'es' | 'en' | 'pt';
    realtor_headline: string;
    realtor_bio_short: string;
    profile_photo_url?: string;
    brand_color: string;
    calendly_url: string;
    funnel_slug: string;
    show_testimonials: boolean;
    created_at: Date;
}

export interface AIInteraction {
    id: string;
    lead_id: string;
    input_text: string;
    ai_output: string;
    timestamp: Date;
}
