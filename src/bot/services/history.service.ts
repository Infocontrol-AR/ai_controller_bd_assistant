import { Injectable } from '@nestjs/common';
import { CrudService } from './crud.service';

@Injectable()
export class HistoryService {
  constructor(private readonly crudService: CrudService) {}

  public async loadData(id_chat?: number, bot?: number): Promise<any[]> {
    const chats = await this.crudService.findAll('chat', true);
    const messages = await this.crudService.findAll('message', true);

    return chats
      .filter((chat) => !id_chat || chat.id === id_chat)
      .map((chat) => ({
        ...chat,
        history: messages
          .filter((msg) => msg.chat_id === chat.id)
          .filter((msg) => bot === undefined || msg.bot === bot)
          .map((msg) => ({
            ...msg,
            role: msg.sender,
          })),
      }));
  }

  public async getOrCreateConversation(
    id_user: number,
    prompt: string,
    id_chat: number,
    createNewConversation: (prompt: string) => Promise<any>,
  ): Promise<any> {
   // console.log(id_chat, id_user, 4);

    let chat;
    if (id_chat) {
      //console.log('no deberia estar aqui');
      chat = await this.crudService.findOne('chat', id_chat);
    }

   // console.log(chat);

    if (!chat) {
      //console.log('nose 2');
      const newConversation = await createNewConversation(prompt);
      //console.log(newConversation);

      const createdChat = await this.crudService.create('chat', {
        id_usuario: id_user,
        label_chat: newConversation.label_chat,
        status: 'activo',
      });

      //console.log(createdChat);

      return { id_chat: createdChat.id, ...createdChat, history: [] };
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

    //console.log('Chat encontrado:', chat);
    //console.log('Nuevos mensajes a insertar:', newMessages);

    if (!chat) {
      throw new Error(`Chat con id ${id_chat} no encontrado.`);
    }

    for (const message of newMessages) {
      const result = await this.crudService.create('message', {
        chat_id: chat.id,
        sender: message.role,
        content: message.content,
        bot: message.bot,
        responseSQL: message.responseSQL || null,
        onRefresh: message.onRefresh || null,
        visible: message.visible || false
      });
      //console.log('Mensaje insertado:', result);
    }
  }

  public async getChatsByUserId(
    id_usuario: number,
  ): Promise<{ id_chat: string; label_chat: string }[]> {
    const chats = await this.crudService.findAll('chat', true);
    const filteredChats = chats.filter(chat => parseInt(chat.id_usuario) == id_usuario);
    const mappedChats = filteredChats.map(chat => ({
      id_chat: chat.id,
      label_chat: chat.label_chat,
      status: chat.status
    }));
    
    // console.log(chats);
    // console.log(filteredChats);
    // console.log(mappedChats);
    
    return mappedChats;
  }
  

  public async getChatById(id_chat: string): Promise<{ history: any }[]> {
    const chat = await this.crudService.findOne('chat', parseInt(id_chat, 10));
    if (!chat) {
      throw new Error(`Chat con id ${id_chat} no encontrado.`);
    }
  
    const messages = await this.crudService.findAll('message', true);
  
    const filteredMessages = messages.filter((msg) => msg.chat_id == chat.id && msg.bot == 1 && msg.visible);
  
    return filteredMessages;
  }
  
  public async deleteChatById(id_chat: string): Promise<{ delete: boolean }> {
    const result = await this.crudService.delete('chat', parseInt(id_chat, 10));
    return { delete: result };
  }
}
