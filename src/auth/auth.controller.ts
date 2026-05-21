import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { LoginResponse, RegisterResponse } from './auth.types';
import { IS_PUBLIC_KEY } from './auth.guard';
import { Roles } from './roles.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @SetMetadata(IS_PUBLIC_KEY, true)
  @ApiOperation({ summary: 'Authentifier un utilisateur (retourne un JWT)' })
  @Post('login')
  login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @ApiOperation({ summary: 'Créer un nouveau compte utilisateur' })
  @Post('register')
  register(@Body() body: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(body);
  }

  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Créer un compte administrateur (SUPER_ADMIN)' })
  @Post('create-admin')
  createAdmin(@Body() body: RegisterDto): Promise<RegisterResponse> {
    return this.authService.createAdmin(body);
  }
}
