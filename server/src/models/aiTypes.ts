export interface AISettings {
    id: string;
    provider: 'gemini';
    api_key: string;
    default_model: string;
    strong_model: string;
    temperature: number;
    max_tokens: number;
    system_prompt: string;
    created_at: Date;
    updated_at: Date;
}

export interface AILog {
    id: string;
    lead_id?: string;
    model: string;
    prompt_preview: string;
    response_preview: string;
    cost_estimated?: number;
    created_at: Date;
}
