import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateAiVideoIdeasDto } from './dto/create-ai-video-ideas.dto';
import { UpdateVideoIdeaDto } from './dto/update-video-idea.dto';
import { GenerateVideoIdeasResponse } from './types/video-idea-response.type';

@Injectable()
export class VideoIdeasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateAndSave(
    userId: string,
    dto: CreateAiVideoIdeasDto,
  ): Promise<GenerateVideoIdeasResponse> {
    const clampedCount = Math.min(10, Math.max(1, Math.trunc(dto.count)));

    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const generationResult = await this.aiService.generateVideoIdeas({
      projectName: project.name,
      niche: project.niche,
      language: project.language,
      targetAudience: project.targetAudience,
      description: project.description ?? undefined,
      tone: dto.tone.trim(),
      count: clampedCount,
    });

    const createdIdeas = await this.prisma.$transaction(
      generationResult.ideas.map((idea) =>
        this.prisma.videoIdea.create({
          data: {
            projectId: project.id,
            title: idea.title,
            hook: idea.hook,
            status: idea.status,
          },
          select: {
            id: true,
            title: true,
            hook: true,
            status: true,
          },
        }),
      ),
    );

    return { ideas: createdIdeas };
  }

  async listByProject(projectId: string, userId: string) {
    await this.ensureOwnedProject(projectId, userId);

    return this.prisma.videoIdea.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateById(id: string, userId: string, dto: UpdateVideoIdeaDto) {
    await this.ensureOwnedVideoIdea(id, userId);

    return this.prisma.videoIdea.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.hook !== undefined ? { hook: dto.hook.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status.trim() } : {}),
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.ensureOwnedVideoIdea(id, userId);
    await this.prisma.videoIdea.delete({ where: { id } });
  }

  private async ensureOwnedProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }
  }

  private async ensureOwnedVideoIdea(id: string, userId: string) {
    const videoIdea = await this.prisma.videoIdea.findFirst({
      where: {
        id,
        project: {
          userId,
        },
      },
      select: { id: true },
    });

    if (!videoIdea) {
      throw new NotFoundException('Video idea not found.');
    }
  }
}
