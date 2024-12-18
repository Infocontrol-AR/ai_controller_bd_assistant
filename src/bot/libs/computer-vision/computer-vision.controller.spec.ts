import { Test, TestingModule } from '@nestjs/testing';
import { ComputerVisionController } from './computer-vision.controller';
import { ComputerVisionService } from './computer-vision.service';

describe('ComputerVisionController', () => {
  let controller: ComputerVisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComputerVisionController],
      providers: [ComputerVisionService],
    }).compile();

    controller = module.get<ComputerVisionController>(ComputerVisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
