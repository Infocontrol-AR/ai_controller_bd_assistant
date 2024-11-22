import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../libs/database/database.service';
import { QueryService } from '../libs/query/query.service';
import { OpenAIService } from '../libs/openai/openai.service';
import { HistoryService } from './history.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryService: QueryService,
    private readonly openAIService: OpenAIService,
    private readonly historyService: HistoryService,
  ) {}

  private async createNewConversation(prompt: any): Promise<any> {
    const instrucciones = ``;
    const messages = [
      {
        role: 'system',
        bot: 0,
        content: instrucciones,
      },
      {
        role: 'user',
        bot: 0,
        content: prompt,
      },
    ];

    const tituloChatResponse = await this.openAIService.useGpt4ModelV2(
      'gpt-4o',
      0.1,
      50,
      messages,
    );
    
    if ('error' in tituloChatResponse) {
      throw new Error(tituloChatResponse.error);  
    }
    
    return {
      label_chat: tituloChatResponse.choices[0].message.content,
    };
    
  }

  public async getOrCreateConversation(
    id_user: number,
    prompt: any,
    id_chat?: string,
  ): Promise<any> {
    return this.historyService.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
      (p) => this.createNewConversation(p),
    );
  }

  public async updateConversationHistory(
    id_user: number,
    id_chat: string,
    newMessages: any[],
  ): Promise<void> {
    await this.historyService.updateConversationHistory(
      id_user,
      id_chat,
      newMessages,
    );
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    return this.historyService.getChatsByUserId(id_usuario);
  }

  public async getChatById(
    id_chat: string,
  ): Promise<{ history: any }[]> {
    return this.historyService.getChatById(id_chat);
  }

  public async deleteChatById(
    id_chat: string,
  ): Promise<{ delete: boolean }> {
    return this.historyService.deleteChatById(id_chat);
  }

  public async chatV3(prompt: any, id_chat: any, id_user: any): Promise<any> {
    let systemContent = ``;
    let model = 'gpt-4o';
    const tables = {};
    let sqlResponseIa;
    let extractedSql;
    let processResponse;
    let system;
    let user;
    let response;
    let resultSQL;
    let chatHistory;

    const getTableStructure = await this.queryService.getTableStructure(tables);

    const conversation = await this.getOrCreateConversation(
      id_user,
      prompt,
      id_chat,
    );
    const currentChatId = conversation.id_chat;

    systemContent = ``;

    let systemC = {
      role: 'system',
      bot: 0,
      content: `ESTRUCTURA DE TABLAS: ${JSON.stringify(getTableStructure)}`,
    };

    system = {
      role: 'system',
      bot: 0,
      content: systemContent,
    };
    user = {
      role: 'user',
      bot: 0,
      content: prompt,
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      systemC,
      system,
      user,
    ]);

    chatHistory = await this.historyService.loadData();
    const bot0History =
      chatHistory
        .find((conv) => conv.id_chat === currentChatId)
        ?.history.filter((item) => item.bot === 0) || [];

    sqlResponseIa = await this.openAIService.useGpt4ModelV2(
      model,
      0.3,
      250,
      bot0History,
    );

    extractedSql =
      await this.queryService.extractAndSanitizeQuery(sqlResponseIa);
    if (!extractedSql) {
      throw new Error(
        'Verifique la logica de su consulta e intente nuevamente',
      );
    }

    response = await this.databaseService.executeQuery(extractedSql);

    system = {
      role: 'system',
      bot: 0,
      content: sqlResponseIa.choices[0].message.content,
    };

    resultSQL = {
      role: 'system',
      bot: 0,
      content: JSON.stringify(response),
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      system,
      resultSQL,
    ]);

    systemContent = ``;

    system = {
      role: 'system',
      bot: 1,
      content: systemContent,
    };

    resultSQL = {
      role: 'system',
      bot: 1,
      content: `CONTEXTO: ${JSON.stringify(response)}`,
    };

    await this.updateConversationHistory(id_user, currentChatId, [
      system,
      resultSQL,
    ]);

    user = {
      role: 'user',
      bot: 1,
      label: true,
      content: prompt,
    };

    await this.updateConversationHistory(id_user, currentChatId, [user]);

    chatHistory = await this.historyService.loadData();

    const bot1History =
      chatHistory
        .find((conv) => conv.id_chat === currentChatId)
        ?.history.filter((item) => item.bot === 1) || [];

    processResponse = await this.openAIService.useGpt4ModelV2(
      model,
      0.6,
      null,
      bot1History,
    );

    system = {
      role: 'system',
      bot: 1,
      label: true,
      responseSQL: response,
      onRefresh: prompt,
      content: processResponse.choices[0].message.content,
    };

    await this.updateConversationHistory(id_user, currentChatId, [system]);

    chatHistory = await this.historyService.loadData();

    return {
      message: 'Success',
      responseIA: processResponse.choices[0].message.content,
      querySQL: extractedSql,
      responseSQL: response,
      fullHistory: chatHistory,
      history:
        chatHistory
          .find((conv) => conv.id_chat === currentChatId)
          ?.history.filter((item) => item.bot === 1 && item.label) || [],
      prompt,
      id_chat: currentChatId,
    };
  }
}
