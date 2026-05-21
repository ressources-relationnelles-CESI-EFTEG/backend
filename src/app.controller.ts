import { Controller, Get, SetMetadata } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './auth/auth.guard';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @ApiOperation({ summary: 'Vérifier que l\'API est opérationnelle' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
