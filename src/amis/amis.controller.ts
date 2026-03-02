import { Controller } from '@nestjs/common';
import { AmisService } from './amis.service';

@Controller('amis')
export class AmisController {
  constructor(private readonly amisService: AmisService) {}
}
