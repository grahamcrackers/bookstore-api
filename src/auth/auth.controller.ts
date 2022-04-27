import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

    @Post('/register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() user: any): Promise<boolean> {
        const newUser = await this.userService.create(user);
        await this.authService.createEmailToken(newUser.email);
        // TODO: user consent
        const sent = await this.authService.sendEmailVerification(newUser.email);

        return sent;
    }

    @Get('verify/:token')
    async verifyEmail(@Param() params): Promise<boolean> {
        const isEmailVerified = await this.authService.verifyEmail(params.token);

        return isEmailVerified;
    }
}
