import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import type { SignInResponse } from './auth.types';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  signIn(@Body() body: SignInDto): Promise<SignInResponse> {
    return this.authService.signIn(body);
  }

  @Post('sign-up')
  signUp(@Body() body: SignUpDto): Promise<SignInResponse> {
    return this.authService.signUp(body);
  }
}
