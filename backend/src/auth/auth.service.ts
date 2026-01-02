import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function sha256(input: string) {
    return createHash('sha256').update(input).digest('hex');
}

type TokenTtl = `${number}s` | `${number}m` | `${number}h` | `${number}d`;


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }


    private accessTtl(): TokenTtl {
        // .env: ACCESS_TOKEN_TTL="15m" gibi
        return (process.env.ACCESS_TOKEN_TTL ?? '15m') as TokenTtl;
    }


    private refreshDays() {
        const n = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? '7');
        return Number.isFinite(n) ? n : 7;
    }

    private signAccessToken(user: { id: string; email: string; role: any }) {
        return this.jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: this.accessTtl() },
        );
    }

    private signRefreshToken(userId: string, jti: string) {
        return this.jwt.sign(
            { sub: userId, jti },
            { secret: process.env.JWT_REFRESH_SECRET!, expiresIn: `${this.refreshDays()}d` },
        );
    }

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) throw new ConflictException('Email already in use');

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                displayName: dto.displayName,
            },
            select: { id: true, email: true, displayName: true, role: true, createdAt: true },
        });

        return { user };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');

        const accessToken = this.signAccessToken(user);

        // refresh token + rotation initial
        const { refreshToken } = await this.issueRefreshToken(user.id);

        return {
            accessToken,
            refreshToken, // controller cookie’ye koyacak
            user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
        };
    }

    async refresh(oldRefreshToken: string) {
        // 1) verify signature
        let payload: any;
        try {
            payload = this.jwt.verify(oldRefreshToken, { secret: process.env.JWT_REFRESH_SECRET! });
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const userId = payload.sub as string;
        const jti = payload.jti as string;

        // 2) db check (hash match + not revoked + not expired)
        const tokenHash = sha256(oldRefreshToken);

        const record = await this.prisma.refreshToken.findUnique({ where: { jti } });
        if (!record) throw new UnauthorizedException('Invalid refresh token');

        if (record.revokedAt) throw new UnauthorizedException('Refresh token revoked');
        if (record.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');
        if (record.userId !== userId) throw new UnauthorizedException('Invalid refresh token');
        if (record.tokenHash !== tokenHash) throw new UnauthorizedException('Invalid refresh token');

        // 3) revoke old
        await this.prisma.refreshToken.update({
            where: { jti },
            data: { revokedAt: new Date() },
        });

        // 4) issue new refresh + new access
        const { refreshToken: newRefreshToken } = await this.issueRefreshToken(userId);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ForbiddenException('User not found');

        const accessToken = this.signAccessToken(user);

        return { accessToken, refreshToken: newRefreshToken };
    }

    async logout(refreshToken: string | undefined) {
        if (!refreshToken) return { ok: true };

        try {
            const payload: any = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET! });
            const jti = payload.jti as string;

            await this.prisma.refreshToken.update({
                where: { jti },
                data: { revokedAt: new Date() },
            }).catch(() => null);

            return { ok: true };
        } catch {
            // token bozuksa da logout başarılı kabul edebiliriz
            return { ok: true };
        }
    }

    private async issueRefreshToken(userId: string) {
        const jti = randomUUID();
        const refreshToken = this.signRefreshToken(userId, jti);

        const expiresAt = new Date(Date.now() + this.refreshDays() * 24 * 60 * 60 * 1000);

        await this.prisma.refreshToken.create({
            data: {
                userId,
                jti,
                tokenHash: sha256(refreshToken),
                expiresAt,
            },
        });

        return { refreshToken };
    }
}
