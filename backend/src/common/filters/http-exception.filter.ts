import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ResponseMessages } from '../enums/response-messages.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();

        const isHttp = exception instanceof HttpException;

        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = isHttp ? exception.getResponse() : null;

        // Nest validation hataları bazen object döner
        const message =
            typeof response === 'string'
                ? response
                : (response as any)?.message ?? ResponseMessages.INTERNAL_SERVER_ERROR;

        const details = (response as any)?.message && Array.isArray((response as any).message)
            ? (response as any).message
            : undefined;

        res.status(status).json({
            success: false,
            error: {
                code: this.mapCode(status),
                message: Array.isArray(message) ? 'Validation error' : message,
                details,
            },
        });
    }

    private mapCode(status: number) {
        switch (status) {
            case 400:
                return ResponseMessages.BAD_GATEWAY;
            case 401:
                return ResponseMessages.UNAUTHORIZED;
            case 403:
                return ResponseMessages.FORBIDDEN;
            case 404:
                return ResponseMessages.NOT_FOUND;
            case 409:
                return ResponseMessages.CONFLICT;
            default:
                return ResponseMessages.INTERNAL_SERVER_ERROR;
        }
    }
}
