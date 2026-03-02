import { Module } from '@nestjs/common';
import { AmisController } from './amis.controller';
import { AmisService } from './amis.service';

@Module({
  controllers: [AmisController],
  providers: [AmisService],
  exports: [AmisService],
})
export class AmisModule {}
