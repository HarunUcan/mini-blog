import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const REFRESH_COOKIE = 'refresh_token';

function cookieOptions() {
    const secure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE ?? 'lax') as 'lax' | 'strict' | 'none';
    const domain = process.env.COOKIE_DOMAIN || undefined;

    return {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        path: '/',
    } as const;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return await this.auth.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.login(dto);

        res.cookie(REFRESH_COOKIE, result.refreshToken, {
            ...cookieOptions(),
            maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? '7') * 24 * 60 * 60 * 1000,
        });

        // refreshToken'u body'den çıkartıyoruz
        const { refreshToken, ...rest } = result;
        return rest;
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.[REFRESH_COOKIE];
        const result = await this.auth.refresh(token);

        res.cookie(REFRESH_COOKIE, result.refreshToken, {
            ...cookieOptions(),
            maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? '7') * 24 * 60 * 60 * 1000,
        });

        const { refreshToken, ...rest } = result;
        return rest; // { accessToken }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.[REFRESH_COOKIE];
        await this.auth.logout(token);

        res.clearCookie(REFRESH_COOKIE, cookieOptions());
        return { ok: true };
    }
}
