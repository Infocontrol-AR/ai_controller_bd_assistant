import { Injectable } from '@nestjs/common';
import { CrudService } from './crud.service';

@Injectable()
export class HistoryService {
  constructor(private readonly crudService: CrudService) {}

  public async loadData(id_chat?: number): Promise<any[]> {
    const chats = await this.crudService.findAll('chat', true);
  
    const messages = await this.crudService.findAll('message', true);
  
    return chats
      .filter((chat) => !id_chat || chat.id === id_chat)
      .map((chat) => ({
        ...chat,
        history: messages.filter((msg) => msg.chat_id === chat.id),
      }));
  }
  
  public async getOrCreateConversation(
    id_user: number,
    prompt: string,
    id_chat: string | undefined,
    createNewConversation: (prompt: string) => Promise<any>,
  ): Promise<any> {
    let chat;
    if (id_chat) {
      chat = await this.crudService.findOne('chat', parseInt(id_chat, 10));
    }

    if (!chat) {
      const newConversation = await createNewConversation(prompt);
      const createdChat = await this.crudService.create('chat', {
        id_usuario: id_user,
        label_chat: newConversation.label_chat,
        status: 'activo',
      });
      return { ...createdChat, history: [] };
    }

    const messages = await this.crudService.findAll('message', true);
    const history = messages.filter((msg) => msg.chat_id === chat.id);
    return { ...chat, history };
  }

  public async updateConversationHistory(
    id_user: number,
    id_chat: string,
    newMessages: any[],
  ): Promise<void> {
    const chat = await this.crudService.findOne('chat', parseInt(id_chat, 10));

    if (!chat) {
      throw new Error(`Chat con id ${id_chat} no encontrado.`);
    }

    for (const message of newMessages) {
      await this.crudService.create('message', {
        chat_id: chat.id,
        sender: message.sender,
        content: message.content,
        bot: message.bot,
        responseSQL: message.responseSQL || null,
        onRefresh: message.onRefresh || null,
      });
    }
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    const chats = await this.crudService.findAll('chat', true);
    return chats
      .filter((chat) => chat.id_usuario === id_usuario)
      .map((chat) => ({
        id_chat: String(chat.id),
        label_chat: chat.label_chat,
      }));
  }

  public async getChatById(id_chat: string): Promise<{ history: any }[]> {
    const chat = await this.crudService.findOne('chat', parseInt(id_chat, 10));
    if (!chat) {
      throw new Error(`Chat con id ${id_chat} no encontrado.`);
    }
    const messages = await this.crudService.findAll('message', true);
    return messages
      .filter((msg) => msg.chat_id === chat.id && msg.bot === 1 && msg.label)
      .map((msg) => ({ history: msg }));
  }
  
  public async deleteChatById(id_chat: string): Promise<{ delete: boolean }> {
    const result = await this.crudService.delete('chat', parseInt(id_chat, 10));
    return { delete: result };
  }
}
