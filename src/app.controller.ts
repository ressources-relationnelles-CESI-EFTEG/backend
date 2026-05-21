import { Controller, Get, SetMetadata } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './auth/auth.guard';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @ApiOperation({ summary: "Vérifier que l'API est opérationnelle" })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @SetMetadata(IS_PUBLIC_KEY, true)
  @SkipThrottle()
  @ApiOperation({
    summary: 'Healthcheck — retourne 200 OK si le service est joignable',
  })
  health(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
