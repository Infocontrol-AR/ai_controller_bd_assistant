import { Test, TestingModule } from '@nestjs/testing';
import { BotController } from './controllers/bot.controller';
import { BotService } from '../bot/services/bot.service';

describe('BotController', () => {
  let controller: BotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotController],
      providers: [BotService],
    }).compile();

    controller = module.get<BotController>(BotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
