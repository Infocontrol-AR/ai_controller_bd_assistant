export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    bot: number;
    content: any;
  }
  
  export interface OpenAIChatCompletionRequest {
    model: string;
    messages: OpenAIMessage[];
    temperature?: number;
    max_tokens?: number;
  }
  
  export interface OpenAIChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: any;
      finish_reason: string;
    }>;
  }
  