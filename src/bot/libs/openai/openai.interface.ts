export interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
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
      message: OpenAIMessage;
      finish_reason: string;
    }>;
  }
  