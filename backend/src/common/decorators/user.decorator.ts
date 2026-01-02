import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { RequestUser } from 'src/auth/strategies/jwt.strategy';

export const User = createParamDecorator(
    (key: keyof RequestUser | undefined, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest<Request>();
        const user = req.user as RequestUser | undefined;

        return key ? user?.[key] : user;
    },
);
