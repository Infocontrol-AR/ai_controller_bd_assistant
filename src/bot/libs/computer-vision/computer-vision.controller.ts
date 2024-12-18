import { Controller } from '@nestjs/common';
import { ComputerVisionService } from './computer-vision.service';

@Controller('computer-vision')
export class ComputerVisionController {
  constructor(private readonly computerVisionService: ComputerVisionService) {}
}
