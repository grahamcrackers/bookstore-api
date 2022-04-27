import { Controller, Get, Post, Put, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostService } from './post.service';

import { Post as PostModel } from '@prisma/client';

@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post('post')
    async createDraft(@Body() postData: { title: string; content?: string; authorEmail: string }): Promise<PostModel> {
        const { title, content, authorEmail } = postData;
        return this.postService.create({
            title,
            content,
            author: {
                connect: { email: authorEmail },
            },
        });
    }

    @Get(':id')
    async getPostById(@Param('id') id: string): Promise<PostModel> {
        return this.postService.findOne({ id: id });
    }

    @Get('feed')
    async getPublishedPosts(): Promise<PostModel[]> {
        return this.postService.findAll({ where: { published: true } });
    }

    @Get('filtered/:searchString')
    async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
        return this.postService.findAll({
            where: {
                OR: [
                    {
                        title: { contains: searchString },
                    },
                    {
                        content: { contains: searchString },
                    },
                ],
            },
        });
    }

    @Put(':id/publish')
    async publishPost(@Param('id') id: string): Promise<PostModel> {
        return this.postService.update({
            where: { id },
            data: { published: true },
        });
    }

    @Delete(':id')
    async deletePost(@Param('id') id: string): Promise<PostModel> {
        return this.postService.remove({ id: id });
    }
}
