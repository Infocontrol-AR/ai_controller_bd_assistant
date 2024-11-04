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

@Controller('bot')
export class BotController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post('chat_v3')
  async chat_v3(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { prompt } = chatBotDto;

    if (!prompt || prompt == '') {
      return res.status(HttpStatus.BAD_REQUEST).json({error: 'Debe enviar un Prompt para realizar la consulta'});
    }

    let response;

    try {
      response = await this.chatService.chatV3(prompt);

      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({error: e.message});
    }
  }
}
