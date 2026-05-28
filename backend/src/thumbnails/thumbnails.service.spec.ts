import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ThumbnailsService } from './thumbnails.service';

describe('ThumbnailsService', () => {
  let service: ThumbnailsService;

  const prismaMock = {
    videoIdea: {
      findFirst: jest.fn(),
    },
    thumbnail: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const aiServiceMock = {
    generateThumbnailPrompt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AiService, useValue: aiServiceMock },
      ],
    }).compile();

    service = module.get<ThumbnailsService>(ThumbnailsService);
  });

  it('should generate and upsert thumbnail for owned video idea', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({
      id: 'idea-1',
      title: 'Docker Basics for Java Devs',
      hook: 'Make your backend deployment repeatable.',
      project: {
        id: 'project-1',
        userId: 'user-1',
        name: 'Backend Channel',
        niche: 'Programming',
        language: 'English',
        targetAudience: 'Java developers',
      },
    });

    aiServiceMock.generateThumbnailPrompt.mockResolvedValue({
      text: 'DOCKER FOR JAVA',
      backgroundIdea: 'Developer desk with terminal and container icons',
      mainObject: 'Developer pointing at deployment pipeline graphic',
      style: 'modern tech YouTube thumbnail + clean modern infographic',
      prompt: 'YouTube thumbnail prompt output',
    });

    prismaMock.thumbnail.upsert.mockResolvedValue({
      id: 'thumb-1',
      text: 'DOCKER FOR JAVA',
      backgroundIdea: 'Developer desk with terminal and container icons',
      mainObject: 'Developer pointing at deployment pipeline graphic',
      style: 'modern tech YouTube thumbnail + clean modern infographic',
      prompt: 'YouTube thumbnail prompt output',
    });

    const result = await service.generateAndSave('user-1', {
      videoIdeaId: 'idea-1',
      style: ' modern tech YouTube thumbnail ',
    });

    expect(aiServiceMock.generateThumbnailPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedStyle: 'modern tech YouTube thumbnail',
      }),
    );
    expect(prismaMock.thumbnail.upsert).toHaveBeenCalled();
    expect(result.id).toBe('thumb-1');
  });

  it('should throw 404 when video idea is not owned', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue(null);

    await expect(
      service.generateAndSave('user-1', {
        videoIdeaId: 'idea-1',
        style: 'modern tech YouTube thumbnail',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should get, update, and delete owned thumbnail', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({
      id: 'idea-1',
      thumbnail: {
        id: 'thumb-1',
        text: 'Old text',
        backgroundIdea: 'Old background',
        mainObject: 'Old object',
        style: 'Old style',
        prompt: 'Old prompt',
      },
    });

    const fetched = await service.getByVideoIdea('idea-1', 'user-1');
    expect(fetched.id).toBe('thumb-1');

    prismaMock.thumbnail.findFirst.mockResolvedValue({ id: 'thumb-1' });
    prismaMock.thumbnail.update.mockResolvedValue({
      id: 'thumb-1',
      text: 'New text',
      backgroundIdea: 'New background',
      mainObject: 'New object',
      style: 'New style',
      prompt: 'New prompt',
    });

    const updated = await service.updateById('thumb-1', 'user-1', {
      text: ' New text ',
      backgroundIdea: ' New background ',
      mainObject: ' New object ',
      style: ' New style ',
      prompt: ' New prompt ',
    });

    expect(prismaMock.thumbnail.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'thumb-1' },
        data: {
          text: 'New text',
          backgroundIdea: 'New background',
          mainObject: 'New object',
          style: 'New style',
          prompt: 'New prompt',
        },
      }),
    );
    expect(updated.id).toBe('thumb-1');

    prismaMock.thumbnail.delete.mockResolvedValue(undefined);
    await service.deleteById('thumb-1', 'user-1');

    expect(prismaMock.thumbnail.delete).toHaveBeenCalledWith({
      where: { id: 'thumb-1' },
    });
  });
});
