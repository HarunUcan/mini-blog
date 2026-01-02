import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    create(authorId: string, dto: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                title: dto.title,
                content: dto.content,
                slug: dto.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
                authorId: authorId
            }
        });
    }

    async update(postId: string, authorId: string, dto: UpdatePostDto) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            throw new NotFoundException({
                code: 'POST_NOT_FOUND',
                message: 'Post bulunamadı',
            });
        }

        if (post.authorId !== authorId) {
            throw new ForbiddenException({
                code: 'POST_NOT_OWNED',
                message: 'Bu post size ait değil',
            });
        }

        return this.prisma.post.update({
            where: { id: postId },
            data: dto,
        });
    }

    async delete(postId: string, authorId: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            throw new NotFoundException({
                code: 'POST_NOT_FOUND',
                message: 'Post bulunamadı',
            });
        }

        if (post.authorId !== authorId) {
            throw new ForbiddenException({
                code: 'POST_NOT_OWNED',
                message: 'Bu post size ait değil',
            });
        }

        await this.prisma.post.delete({ where: { id: postId } });
        return { deleted: true };
    }

    findAllPublic() {
        return this.prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                content: true,
                authorId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async findOnePublic(postId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            throw new NotFoundException({
                code: 'POST_NOT_FOUND',
                message: 'Post bulunamadı',
            });
        }

        return post;
    }

    findMyPosts(authorId: string) {
        return this.prisma.post.findMany({
            where: { authorId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
