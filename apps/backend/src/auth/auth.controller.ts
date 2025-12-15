import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute to prevent brute force
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register new company and user' })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 signups per minute to prevent abuse
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('google-signin')
  @ApiOperation({ summary: 'Sign in with Google' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 OAuth attempts per minute
  async googleSignIn(@Body() googleSignInDto: GoogleSignInDto) {
    return this.authService.googleSignIn(googleSignInDto);
  }

  @Post('google-callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback from Supabase' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 OAuth attempts per minute
  async googleCallback(
    @Body() body: { email: string; name: string; googleId: string; avatarUrl?: string }
  ) {
    // Reuse the existing googleSignIn logic
    return this.authService.googleSignIn({
      email: body.email,
      firstName: body.name.split(' ')[0] || body.name,
      lastName: body.name.split(' ').slice(1).join(' ') || '',
      googleId: body.googleId,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @SkipThrottle() // Authenticated users have already passed login throttle
  async getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.userId);
  }
}
