import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
    sub: string;     // userId
    email: string;
    jti?: string;
};

export type RequestUser = {
    id: string;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        return { id: payload.sub, email: payload.email };
    }
}
