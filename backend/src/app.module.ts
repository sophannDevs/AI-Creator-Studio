import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SeoModule } from './seo/seo.module';
import { ScriptsModule } from './scripts/scripts.module';
import { ThumbnailsModule } from './thumbnails/thumbnails.module';
import { UsersModule } from './users/users.module';
import { VideoIdeasModule } from './video-ideas/video-ideas.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    SeoModule,
    ScriptsModule,
    ThumbnailsModule,
    AiModule,
    VideoIdeasModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
