import { Module } from '@nestjs/common';
import { ComputerVisionService } from './computer-vision.service';
import { ComputerVisionController } from './computer-vision.controller';

@Module({
  controllers: [ComputerVisionController],
  providers: [ComputerVisionService],
})
export class ComputerVisionModule {}
