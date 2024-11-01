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

@Controller('bot')
export class BotController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Post('chat_v3')
  async chat_v3(@Body() chatBotDto: ChatBotDto, @Res() res) {
    const { prompt } = chatBotDto;

    let response;

    try {
      response = this.chatService.chatV3(prompt);

      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json(response);
    }
  }
}
