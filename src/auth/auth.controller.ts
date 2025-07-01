import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered.' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists.' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Log in a user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in.', schema: { example: { accessToken: 'your_jwt_token' } } })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('profile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get authenticated user profile' })
    @ApiBearerAuth() // Menunjukkan bahwa endpoint ini memerlukan Bearer Token
    @ApiResponse({ status: HttpStatus.OK, description: 'Authenticated user profile.', schema: { example: { message: 'Data pengguna yang diautentikasi', user: { userId: 'someId', email: 'test@example.com' } } } })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized if token is invalid or missing.' })
    getProfile(@CurrentUser() user: any) {
        return {
            message: 'Data pengguna yang diautentikasi',
            user: {
                userId: user.userId,
                email: user.email,
            },
        };
    }
}
