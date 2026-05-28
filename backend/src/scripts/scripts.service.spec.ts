import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScriptsService } from './scripts.service';

describe('ScriptsService', () => {
  let service: ScriptsService;

  const prismaMock = {
    videoIdea: {
      findFirst: jest.fn(),
    },
    script: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const aiServiceMock = {
    generateScript: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AiService, useValue: aiServiceMock },
      ],
    }).compile();

    service = module.get<ScriptsService>(ScriptsService);
  });

  it('should generate and upsert script for owned video idea', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({
      id: 'idea-1',
      title: 'API Design for Beginners',
      hook: 'Most APIs fail before launch.',
      project: {
        id: 'project-1',
        userId: 'user-1',
        name: 'Backend Channel',
        niche: 'Programming',
        language: 'English',
        targetAudience: 'Junior developers',
      },
    });

    aiServiceMock.generateScript.mockResolvedValue({
      hook: 'Generated hook',
      intro: 'Generated intro',
      mainContent: 'Generated main content',
      conclusion: 'Generated conclusion',
      cta: 'Generated cta',
      duration: '5 minutes',
      tone: 'Beginner friendly',
    });

    prismaMock.script.upsert.mockResolvedValue({
      id: 'script-1',
      hook: 'Generated hook',
      intro: 'Generated intro',
      mainContent: 'Generated main content',
      conclusion: 'Generated conclusion',
      cta: 'Generated cta',
      duration: '5 minutes',
      tone: 'Beginner friendly',
    });

    const result = await service.generateAndSave('user-1', {
      videoIdeaId: 'idea-1',
      duration: '5 minutes',
      tone: 'Beginner friendly',
      language: 'English',
    });

    expect(aiServiceMock.generateScript).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: '5 minutes',
        tone: 'Beginner friendly',
      }),
    );
    expect(prismaMock.script.upsert).toHaveBeenCalled();
    expect(result.id).toBe('script-1');
  });

  it('should throw 404 when video idea is not owned', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue(null);

    await expect(
      service.generateAndSave('user-1', {
        videoIdeaId: 'idea-1',
        duration: '5 minutes',
        tone: 'Beginner friendly',
        language: 'English',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update and delete owned script', async () => {
    prismaMock.script.findFirst.mockResolvedValue({ id: 'script-1' });
    prismaMock.script.update.mockResolvedValue({
      id: 'script-1',
      hook: 'Updated hook',
      intro: 'Updated intro',
      mainContent: 'Updated main content',
      conclusion: 'Updated conclusion',
      cta: 'Updated cta',
      duration: '6 minutes',
      tone: 'Professional',
    });

    const updated = await service.updateById('script-1', 'user-1', {
      hook: ' Updated hook ',
      intro: ' Updated intro ',
      mainContent: ' Updated main content ',
      conclusion: ' Updated conclusion ',
      cta: ' Updated cta ',
      duration: ' 6 minutes ',
      tone: ' Professional ',
    });

    expect(prismaMock.script.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'script-1' },
        data: {
          hook: 'Updated hook',
          intro: 'Updated intro',
          mainContent: 'Updated main content',
          conclusion: 'Updated conclusion',
          cta: 'Updated cta',
          duration: '6 minutes',
          tone: 'Professional',
        },
      }),
    );
    expect(updated.id).toBe('script-1');

    prismaMock.script.delete.mockResolvedValue(undefined);
    await service.deleteById('script-1', 'user-1');

    expect(prismaMock.script.delete).toHaveBeenCalledWith({
      where: { id: 'script-1' },
    });
  });
});
