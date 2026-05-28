import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiScriptDto } from './dto/create-ai-script.dto';
import { UpdateScriptDto } from './dto/update-script.dto';
import { ScriptResponse } from './types/script-response.type';

@Injectable()
export class ScriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateAndSave(
    userId: string,
    dto: CreateAiScriptDto,
  ): Promise<ScriptResponse> {
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

    const generated = await this.aiService.generateScript({
      projectName: videoIdea.project.name,
      niche: videoIdea.project.niche,
      language: dto.language.trim(),
      targetAudience: videoIdea.project.targetAudience,
      title: videoIdea.title,
      hook: videoIdea.hook ?? undefined,
      duration: dto.duration.trim(),
      tone: dto.tone.trim(),
    });

    const script = await this.prisma.script.upsert({
      where: { videoIdeaId: videoIdea.id },
      create: {
        videoIdeaId: videoIdea.id,
        hook: generated.hook,
        intro: generated.intro,
        mainContent: generated.mainContent,
        conclusion: generated.conclusion,
        cta: generated.cta,
        duration: generated.duration,
        tone: generated.tone,
      },
      update: {
        hook: generated.hook,
        intro: generated.intro,
        mainContent: generated.mainContent,
        conclusion: generated.conclusion,
        cta: generated.cta,
        duration: generated.duration,
        tone: generated.tone,
      },
      select: {
        id: true,
        hook: true,
        intro: true,
        mainContent: true,
        conclusion: true,
        cta: true,
        duration: true,
        tone: true,
      },
    });

    return script;
  }

  async getByVideoIdea(
    ideaId: string,
    userId: string,
  ): Promise<ScriptResponse> {
    const videoIdea = await this.prisma.videoIdea.findFirst({
      where: {
        id: ideaId,
        project: {
          userId,
        },
      },
      include: {
        script: {
          select: {
            id: true,
            hook: true,
            intro: true,
            mainContent: true,
            conclusion: true,
            cta: true,
            duration: true,
            tone: true,
          },
        },
      },
    });

    if (!videoIdea) {
      throw new NotFoundException('Video idea not found.');
    }

    if (!videoIdea.script) {
      throw new NotFoundException('Script not found.');
    }

    return videoIdea.script;
  }

  async updateById(
    id: string,
    userId: string,
    dto: UpdateScriptDto,
  ): Promise<ScriptResponse> {
    await this.ensureOwnedScript(id, userId);

    return this.prisma.script.update({
      where: { id },
      data: {
        ...(dto.hook !== undefined ? { hook: dto.hook.trim() } : {}),
        ...(dto.intro !== undefined ? { intro: dto.intro.trim() } : {}),
        ...(dto.mainContent !== undefined
          ? { mainContent: dto.mainContent.trim() }
          : {}),
        ...(dto.conclusion !== undefined
          ? { conclusion: dto.conclusion.trim() }
          : {}),
        ...(dto.cta !== undefined ? { cta: dto.cta.trim() } : {}),
        ...(dto.duration !== undefined
          ? { duration: dto.duration.trim() }
          : {}),
        ...(dto.tone !== undefined ? { tone: dto.tone.trim() } : {}),
      },
      select: {
        id: true,
        hook: true,
        intro: true,
        mainContent: true,
        conclusion: true,
        cta: true,
        duration: true,
        tone: true,
      },
    });
  }

  async deleteById(id: string, userId: string): Promise<void> {
    await this.ensureOwnedScript(id, userId);
    await this.prisma.script.delete({ where: { id } });
  }

  private async ensureOwnedScript(id: string, userId: string): Promise<void> {
    const script = await this.prisma.script.findFirst({
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

    if (!script) {
      throw new NotFoundException('Script not found.');
    }
  }
}
