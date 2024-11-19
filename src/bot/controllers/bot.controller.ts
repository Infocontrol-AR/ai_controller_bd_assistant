import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ChatBotDto } from '../dto/chat-bot.dot';
import { ChatService } from '../services/chat.service';
import { error } from 'console';

@Controller('chat')
export class BotController {
  constructor(private readonly chatService: ChatService) {}

  @Post('enviar-mensaje')
  async chat_v3(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { prompt } = chatBotDto;
    const { id_chat } = chatBotDto;
    const { id_user } = chatBotDto;

    if (!prompt || prompt == '') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Debe enviar un Prompt para realizar la consulta' });
    }

    let response;

    try {
      response = await this.chatService.chatV3(prompt, id_chat, id_user);

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const errorDetails = {
        message: e.message,
        name: e.name || 'Error',
        stack: e.stack || 'No stack trace available',
        code: e.code || 'No code available',
        statusCode: e.status || e.response?.status || 'N/A',
        details: e.details || 'No additional details',
        cause: e.cause || 'No inner cause available',
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Error al procesar la solicitud',
        details: errorDetails,
      });
    }
  }

  @Get('obtener-chats/:id_user')
  async obtener_chats(@Param('id_user') id_user: number, @Res() res) {
    let response;

    try {
      response = await this.chatService.getChatsByUserId(id_user);

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const errorDetails = {
        message: e.message,
        name: e.name || 'Error',
        stack: e.stack || 'No stack trace available',
        code: e.code || 'No code available',
        statusCode: e.status || e.response?.status || 'N/A',
        details: e.details || 'No additional details',
        cause: e.cause || 'No inner cause available',
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Error al procesar la solicitud',
        details: errorDetails,
      });
    }
  }

  @Get('obtener-chat/:id_chat')
  async obtener_chat(@Param('id_chat') id_chat: string, @Res() res) {
    let response;

    try {
      response = await this.chatService.getChatById(id_chat);

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const errorDetails = {
        message: e.message,
        name: e.name || 'Error',
        stack: e.stack || 'No stack trace available',
        code: e.code || 'No code available',
        statusCode: e.status || e.response?.status || 'N/A',
        details: e.details || 'No additional details',
        cause: e.cause || 'No inner cause available',
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Error al procesar la solicitud',
        details: errorDetails,
      });
    }
  }

  @Delete('eliminar-chat/:id_chat')
  async eliminar_chat(@Param('id_chat') id_chat: string, @Res() res) {
    let response;

    try {
      response = await this.chatService.deleteChatById(id_chat);

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      const errorDetails = {
        message: e.message,
        name: e.name || 'Error',
        stack: e.stack || 'No stack trace available',
        code: e.code || 'No code available',
        statusCode: e.status || e.response?.status || 'N/A',
        details: e.details || 'No additional details',
        cause: e.cause || 'No inner cause available',
        timestamp: new Date().toISOString(),
      };

      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Error al procesar la solicitud',
        details: errorDetails,
      });
    }
  }
}
