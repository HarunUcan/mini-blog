import { Body, UseGuards, Controller, Post, Patch, Param, Delete, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/common/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    // POST /posts
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@User('id') userId: string, @Body() dto: CreatePostDto) {
        return this.postsService.create(userId, dto);
    }

    // POST /posts/publish/:id
    @UseGuards(JwtAuthGuard)
    @Post('publish/:id')
    publish(@Param('id') id: string, @User('id') userId: string) {
        return this.postsService.publish(id, userId);
    }

    // PATCH /posts/:id
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @User('id') userId: string, @Body() dto: UpdatePostDto) {
        return this.postsService.update(id, userId, dto);
    }

    // DELETE /posts/:id
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id: string, @User('id') userId: string) {
        return this.postsService.delete(id, userId);
    }

    // Public list
    // GET /posts
    @Get()
    findAll() {
        return this.postsService.findAllPublic();
    }

    // Public detail
    // GET /posts/:slug
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.postsService.findOnePublic(slug);
    }

    // My posts
    // GET /posts/me/list
    @UseGuards(JwtAuthGuard)
    @Get('me/list')
    myPosts(@User('id') userId: string) {
        return this.postsService.findMyPosts(userId);
    }
}
