import { Controller } from '@nestjs/common';
import { ProgressionsService } from './progressions.service';

@Controller('progressions')
export class ProgressionsController {
  constructor(private readonly progressionsService: ProgressionsService) {}
}
