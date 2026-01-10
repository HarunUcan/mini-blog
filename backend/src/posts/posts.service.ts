import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    create(authorId: string, dto: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                title: dto.title ?? '',
                content: dto.content, // empty doc gelebilir
                status: PostStatus.DRAFT,
                authorId,
                slug: null, // publish'te set edilecek
            },
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

    async publish(postId: string, authorId: string) {
        const post = await this.prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            throw new NotFoundException({ code: 'POST_NOT_FOUND', message: 'Post bulunamadı' });
        }

        if (post.authorId !== authorId) {
            throw new ForbiddenException({ code: 'POST_NOT_OWNED', message: 'Bu post size ait değil' });
        }

        if (post.status === PostStatus.PUBLISHED) {
            return post; // idempotent
        }

        const title = (post.title ?? '').trim();
        if (!title) {
            throw new BadRequestException({ code: 'POST_TITLE_REQUIRED', message: 'Başlık zorunludur' });
        }

        // TipTap JSON boş mu kontrolü
        // content: Json tipinde olduğu için any gibi gelir
        // const isEmpty = this.isTiptapEmpty(post.content as any);
        // if (isEmpty) {
        //     throw new BadRequestException({ code: 'POST_CONTENT_REQUIRED', message: 'İçerik boş olamaz' });
        // }

        const baseSlug = this.slugify(title);

        return this.prisma.post.update({
            where: { id: postId },
            data: {
                slug: baseSlug,
                status: PostStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });
    }

    findAllPublic() {
        return this.prisma.post.findMany({
            where: { status: PostStatus.PUBLISHED },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                content: true,
                authorId: true,
                author: {
                    select: {
                        displayName: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
                publishedAt: true,
                slug: true,
                status: true,
            },
        });
    }

    async findOnePublic(postSlug: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug: postSlug },
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

    async findMyPost(authorId: string, postId: string) {
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
        });
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
        return post;
    }



    // --- helpers ---

    private slugify(input: string) {
        return input
            .toLowerCase()
            .trim()
            // Türkçe karakterleri normalize et
            .replace(/ç/g, 'c')
            .replace(/ğ/g, 'g')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ş/g, 's')
            .replace(/ü/g, 'u')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            + `-${Date.now()}`; // çakışma olmasın diye sonuna timestamp ekle
    }

    private isTiptapEmpty(doc: any): boolean {
        // TipTap empty doc genelde:
        // { type: 'doc', content: [] } veya { type:'doc', content:[{type:'paragraph'}] } gibi gelebilir
        if (!doc || doc.type !== 'doc') return true;

        const content = Array.isArray(doc.content) ? doc.content : [];
        if (content.length === 0) return true;

        // tek paragraf ve içinde text yoksa empty say
        if (content.length === 1 && content[0]?.type === 'paragraph') {
            const p = content[0];
            const pContent = Array.isArray(p.content) ? p.content : [];
            if (pContent.length === 0) return true;
            // sadece boş text node’ları
            const hasRealText = pContent.some((n: any) => n.type === 'text' && (n.text ?? '').trim().length > 0);
            return !hasRealText;
        }

        return false;
    }
}
