import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiSeoDto } from './dto/create-ai-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { SeoResponse } from './types/seo-response.type';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateAndSave(
    userId: string,
    dto: CreateAiSeoDto,
  ): Promise<SeoResponse> {
    const videoIdea = await this.prisma.videoIdea.findFirst({
      where: {
        id: dto.videoIdeaId,
        project: {
          userId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!videoIdea) {
      throw new NotFoundException('Video idea not found.');
    }

    const targetKeyword = dto.targetKeyword.trim();
    const generated = await this.aiService.generateSeo({
      projectName: videoIdea.project.name,
      niche: videoIdea.project.niche,
      language: videoIdea.project.language,
      targetAudience: videoIdea.project.targetAudience,
      title: videoIdea.title,
      summary: videoIdea.hook ?? undefined,
      targetKeyword,
    });

    return this.prisma.seoMetadata.upsert({
      where: { videoIdeaId: videoIdea.id },
      create: {
        videoIdeaId: videoIdea.id,
        title: generated.title,
        description: generated.description,
        tags: generated.tags,
        hashtags: generated.hashtags,
        seoScore: generated.seoScore,
      },
      update: {
        title: generated.title,
        description: generated.description,
        tags: generated.tags,
        hashtags: generated.hashtags,
        seoScore: generated.seoScore,
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        hashtags: true,
        seoScore: true,
      },
    });
  }

  async getByVideoIdea(ideaId: string, userId: string): Promise<SeoResponse> {
    const videoIdea = await this.prisma.videoIdea.findFirst({
      where: {
        id: ideaId,
        project: {
          userId,
        },
      },
      include: {
        seoMetadata: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            hashtags: true,
            seoScore: true,
          },
        },
      },
    });

    if (!videoIdea) {
      throw new NotFoundException('Video idea not found.');
    }

    if (!videoIdea.seoMetadata) {
      throw new NotFoundException('SEO metadata not found.');
    }

    return videoIdea.seoMetadata;
  }

  async updateById(
    id: string,
    userId: string,
    dto: UpdateSeoDto,
  ): Promise<SeoResponse> {
    await this.ensureOwnedSeo(id, userId);

    return this.prisma.seoMetadata.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.tags !== undefined
          ? {
              tags: dto.tags
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0),
            }
          : {}),
        ...(dto.hashtags !== undefined
          ? {
              hashtags: dto.hashtags
                .map((hashtag) => hashtag.trim())
                .filter((hashtag) => hashtag.length > 0),
            }
          : {}),
        ...(dto.seoScore !== undefined ? { seoScore: dto.seoScore } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        hashtags: true,
        seoScore: true,
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.ensureOwnedSeo(id, userId);
    await this.prisma.seoMetadata.delete({ where: { id } });
  }

  private async ensureOwnedSeo(id: string, userId: string): Promise<void> {
    const seoMetadata = await this.prisma.seoMetadata.findFirst({
      where: {
        id,
        videoIdea: {
          project: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    if (!seoMetadata) {
      throw new NotFoundException('SEO metadata not found.');
    }
  }
}
