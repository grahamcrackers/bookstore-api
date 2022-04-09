import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './post/post.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, PostModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
