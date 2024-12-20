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
  Put,
} from '@nestjs/common';
import { ChatBotDto } from '../dto/chat-bot.dot';
import { ChatService } from '../services/chat.service';
import { CrudService } from '../services/crud.service';
import { error } from 'console';

@Controller('chat')
export class BotController {
  constructor(
    private readonly chatService: ChatService,
    private readonly crudService: CrudService,
  ) {}

  @Post('enviar-mensaje')
  async chat_v3(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { prompt } = chatBotDto;
    const { id_chat } = chatBotDto;
    const { id_user } = chatBotDto;
    const { id_empresas } = chatBotDto;
    const { documents } = chatBotDto;

    // console.log(chatBotDto);

    if (!prompt || prompt == '') {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Debe enviar un Prompt para realizar la consulta' });
    }

    if (!id_user || isNaN(id_user)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Debe enviar un Id de Usuario para realizar la consulta',
      });
    }

    let response;

    try {
      response = await this.chatService.chatV3(
        prompt,
        id_chat,
        id_user,
        id_empresas,
        documents
      );

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

      console.log(errorDetails);

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

  @Put('cambiar-estado')
  async cambiar_estado(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { id_chat } = chatBotDto;
    const { status } = chatBotDto;

    let response;

    try {
      response = await this.chatService.changeChatStatus(id_chat, status);

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
      // response = await this.chatService.deleteChatById(id_chat);

      response = [];

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

  @Post('abm')
  async operar(@Body() body: any, @Res() res) {
    const { tableName, id, values, operation } = body;

    if (
      !tableName ||
      !operation ||
      (operation !== 'insert' &&
        operation !== 'update' &&
        operation !== 'delete' &&
        operation !== 'obtener' &&
        operation !== 'obtenerPorId')
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Parámetros inválidos',
        details: {
          message:
            "Se requiere 'tableName', 'operation' y un valor válido para 'operation' ('insert', 'update', 'delete', 'obtener', 'obtenerPorId').",
        },
      });
    }

    if (
      ['insert', 'update'].includes(operation) &&
      (!values || !Array.isArray(values) || values.length === 0)
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Parámetros inválidos',
        details: {
          message:
            "La operación 'insert' o 'update' requiere un array no vacío en 'values'.",
        },
      });
    }

    if (
      operation === 'update' ||
      operation === 'delete' ||
      operation === 'obtenerPorId'
    ) {
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Parámetros inválidos',
          details: {
            message:
              "La operación 'update', 'delete' o 'obtenerPorId' requiere un 'id'.",
          },
        });
      }
    }

    try {
      let result;
      switch (operation) {
        case 'insert':
          result = await this.crudService.create(tableName, values[0]);
          break;
        case 'update':
          result = await this.crudService.update(tableName, id, values[0]);
          break;
        case 'delete':
          result = await this.crudService.delete(tableName, id);
          break;
        case 'obtener':
          result = await this.crudService.findAll(tableName);
          break;
        case 'obtenerPorId':
          result = await this.crudService.findOne(tableName, id);
          break;
        default:
          throw new Error('Operación no soportada.');
      }

      return res.status(HttpStatus.OK).json(result);
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
