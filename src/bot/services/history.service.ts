import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class HistoryService {
  private readonly dataFilePath = join(
    process.cwd(),
    'src',
    'bot',
    'data',
    'data.json',
  );

  public async loadData(): Promise<any[]> {
    try {
      const data = await readFile(this.dataFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  private async saveData(data: any[]): Promise<void> {
    await writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  public async getOrCreateConversation(
    id_user: number,
    prompt: any,
    id_chat: string,
    createNewConversation: (prompt: any) => Promise<any>,
  ): Promise<any> {
    const data = await this.loadData();

    let conversation = data.find(
      (conv) => conv.id_usuario === id_user && conv.id_chat === id_chat,
    );

    if (!conversation) {
      const newConversation = await createNewConversation(prompt);
      conversation = {
        ...newConversation,
        id: data.length + 1,
        id_usuario: id_user,
        id_chat: id_chat || `chat_${Date.now()}`,
        history: [],
      };

      data.push(conversation);
      await this.saveData(data);
    }

    return conversation;
  }

  public async updateConversationHistory(
    id_user: number,
    id_chat: string,
    newMessages: any[],
  ): Promise<void> {
    const data = await this.loadData();
    const conversation = data.find(
      (conv) => conv.id_usuario === id_user && conv.id_chat === id_chat,
    );

    if (!conversation) {
      throw new Error(
        `Conversación con id_chat ${id_chat} no encontrada para el usuario ${id_user}.`,
      );
    }

    conversation.history.push(...newMessages);
    await this.saveData(data);
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    const data = await this.loadData();
    return data
      .filter((conv) => conv.id_usuario === id_usuario)
      .map((conv) => ({
        id_chat: conv.id_chat,
        label_chat: conv.label_chat,
      }));
  }

  public async getChatById(
    id_chat: string,
  ): Promise<{ history: any }[]> {
    const data = await this.loadData();
    return data
      .filter((conv) => conv.id_chat === id_chat)
      .map((conv) => ({
        history: conv.history.filter((o) => o.bot === 1 && o.label),
      }));
  }

  public async deleteChatById(id_chat: string): Promise<{ delete: boolean }> {
    try {
      const data = await this.loadData();
      const updatedData = data.filter((conv) => conv.id_chat !== id_chat);

      await this.saveData(updatedData);
      return { delete: true };
    } catch (error) {
      return { delete: false };
    }
  }
}
