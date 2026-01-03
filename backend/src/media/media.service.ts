import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
    constructor(private readonly prisma: PrismaService) { }

    async createMedia(params: {
        ownerId: string;
        postId?: string;
        path: string;
        mimeType: string;
        sizeBytes: number;
        width?: number | null;
        height?: number | null;
    }) {
        return this.prisma.media.create({
            data: {
                ownerId: params.ownerId,
                postId: params.postId ?? null,
                path: params.path,
                mimeType: params.mimeType,
                sizeBytes: params.sizeBytes,
                width: params.width ?? null,
                height: params.height ?? null,
            },
        });
    }
}
