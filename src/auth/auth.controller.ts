import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { LoginResponse, RegisterResponse } from './auth.types';
import { IS_PUBLIC_KEY } from './auth.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Post('login')
  login(@Body() body: LoginDto): Promise<LoginResponse> {
    return this.authService.login(body);
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @Post('register')
  register(@Body() body: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(body);
  }

  @Roles('SUPER_ADMIN')
  @Post('create-admin')
  createAdmin(@Body() body: RegisterDto): Promise<RegisterResponse> {
    return this.authService.createAdmin(body);
  }
}
