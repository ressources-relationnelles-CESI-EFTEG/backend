import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY } from './auth/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
