import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiThumbnailDto } from './dto/create-ai-thumbnail.dto';
import { UpdateThumbnailDto } from './dto/update-thumbnail.dto';
import { ThumbnailResponse } from './types/thumbnail-response.type';

@Injectable()
export class ThumbnailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateAndSave(
    userId: string,
    dto: CreateAiThumbnailDto,
  ): Promise<ThumbnailResponse> {
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

    const generated = await this.aiService.generateThumbnailPrompt({
      projectName: videoIdea.project.name,
      niche: videoIdea.project.niche,
      language: videoIdea.project.language,
      targetAudience: videoIdea.project.targetAudience,
      title: videoIdea.title,
      hook: videoIdea.hook ?? undefined,
      requestedStyle: dto.style.trim(),
    });

    return this.prisma.thumbnail.upsert({
      where: { videoIdeaId: videoIdea.id },
      create: {
        videoIdeaId: videoIdea.id,
        text: generated.text,
        backgroundIdea: generated.backgroundIdea,
        mainObject: generated.mainObject,
        style: generated.style,
        prompt: generated.prompt,
      },
      update: {
        text: generated.text,
        backgroundIdea: generated.backgroundIdea,
        mainObject: generated.mainObject,
        style: generated.style,
        prompt: generated.prompt,
      },
      select: {
        id: true,
        text: true,
        backgroundIdea: true,
        mainObject: true,
        style: true,
        prompt: true,
      },
    });
  }

  async getByVideoIdea(
    ideaId: string,
    userId: string,
  ): Promise<ThumbnailResponse> {
    const videoIdea = await this.prisma.videoIdea.findFirst({
      where: {
        id: ideaId,
        project: {
          userId,
        },
      },
      include: {
        thumbnail: {
          select: {
            id: true,
            text: true,
            backgroundIdea: true,
            mainObject: true,
            style: true,
            prompt: true,
          },
        },
      },
    });

    if (!videoIdea) {
      throw new NotFoundException('Video idea not found.');
    }

    if (!videoIdea.thumbnail) {
      throw new NotFoundException('Thumbnail not found.');
    }

    return videoIdea.thumbnail;
  }

  async updateById(
    id: string,
    userId: string,
    dto: UpdateThumbnailDto,
  ): Promise<ThumbnailResponse> {
    await this.ensureOwnedThumbnail(id, userId);

    return this.prisma.thumbnail.update({
      where: { id },
      data: {
        ...(dto.text !== undefined ? { text: dto.text.trim() } : {}),
        ...(dto.backgroundIdea !== undefined
          ? { backgroundIdea: dto.backgroundIdea.trim() }
          : {}),
        ...(dto.mainObject !== undefined
          ? { mainObject: dto.mainObject.trim() }
          : {}),
        ...(dto.style !== undefined ? { style: dto.style.trim() } : {}),
        ...(dto.prompt !== undefined ? { prompt: dto.prompt.trim() } : {}),
      },
      select: {
        id: true,
        text: true,
        backgroundIdea: true,
        mainObject: true,
        style: true,
        prompt: true,
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.ensureOwnedThumbnail(id, userId);
    await this.prisma.thumbnail.delete({ where: { id } });
  }

  private async ensureOwnedThumbnail(
    id: string,
    userId: string,
  ): Promise<void> {
    const thumbnail = await this.prisma.thumbnail.findFirst({
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

    if (!thumbnail) {
      throw new NotFoundException('Thumbnail not found.');
    }
  }
}
