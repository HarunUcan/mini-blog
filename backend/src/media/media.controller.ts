import {
    BadRequestException,
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerDiskStorage, imageFileFilter } from './multer.config';
import { MediaService } from './media.service';
import sharp from 'sharp';
import { User } from 'src/common/decorators/user.decorator';

type JwtUser = { sub: string; email: string; role: string };

@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: multerDiskStorage,
            fileFilter: imageFileFilter,
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @User() user: JwtUser,
        @Body('postId') postId?: string,
    ) {
        if (!file) throw new BadRequestException('File is required');

        // uploads klasörüne yazıldığı için relative path:
        const path = `uploads/${file.filename}`;

        // width/height okumayı dene (fail ederse null bırak)
        let width: number | null = null;
        let height: number | null = null;

        try {
            const meta = await sharp(file.path).metadata();
            width = meta.width ?? null;
            height = meta.height ?? null;
        } catch {
            // ignore
        }

        const created = await this.mediaService.createMedia({
            ownerId: user.sub,
            postId,
            path,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            width,
            height,
        });

        // URL: serveRoot '/uploads' olduğu için
        const url = `/uploads/${file.filename}`;

        return {
            id: created.id,
            path: created.path,
            url,
            mimeType: created.mimeType,
            sizeBytes: created.sizeBytes,
            width: created.width,
            height: created.height,
        };
    }
}
