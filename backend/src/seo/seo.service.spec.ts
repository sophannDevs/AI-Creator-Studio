import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;

  const prismaMock = {
    videoIdea: {
      findFirst: jest.fn(),
    },
    seoMetadata: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const aiServiceMock = {
    generateSeo: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AiService, useValue: aiServiceMock },
      ],
    }).compile();

    service = module.get<SeoService>(SeoService);
  });

  it('should generate and upsert seo metadata for owned video idea', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({
      id: 'idea-1',
      title: 'Docker Basics for Java Devs',
      hook: 'Move your Java backend from laptop to production safely.',
      project: {
        id: 'project-1',
        userId: 'user-1',
        name: 'Backend Channel',
        niche: 'Programming',
        language: 'English',
        targetAudience: 'Java developers',
      },
    });

    aiServiceMock.generateSeo.mockResolvedValue({
      title: 'Docker for Java Developers | Docker Basics for Java Devs',
      description: 'Learn Docker for Java developers with a practical setup.',
      tags: ['docker for java developers', 'programming'],
      hashtags: ['#DockerForJavaDevelopers', '#Programming'],
      seoScore: 92,
    });

    prismaMock.seoMetadata.upsert.mockResolvedValue({
      id: 'seo-1',
      title: 'Docker for Java Developers | Docker Basics for Java Devs',
      description: 'Learn Docker for Java developers with a practical setup.',
      tags: ['docker for java developers', 'programming'],
      hashtags: ['#DockerForJavaDevelopers', '#Programming'],
      seoScore: 92,
    });

    const result = await service.generateAndSave('user-1', {
      videoIdeaId: 'idea-1',
      targetKeyword: ' Docker for Java developers ',
    });

    expect(aiServiceMock.generateSeo).toHaveBeenCalledWith(
      expect.objectContaining({
        targetKeyword: 'Docker for Java developers',
      }),
    );
    expect(prismaMock.seoMetadata.upsert).toHaveBeenCalled();
    expect(result.id).toBe('seo-1');
  });

  it('should throw 404 when video idea is not owned', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue(null);

    await expect(
      service.generateAndSave('user-1', {
        videoIdeaId: 'idea-1',
        targetKeyword: 'Docker for Java developers',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should get, update, and delete owned seo metadata', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({
      id: 'idea-1',
      seoMetadata: {
        id: 'seo-1',
        title: 'Old title',
        description: 'Old description',
        tags: ['tag-1'],
        hashtags: ['#tag1'],
        seoScore: 75,
      },
    });

    const fetched = await service.getByVideoIdea('idea-1', 'user-1');
    expect(fetched.id).toBe('seo-1');

    prismaMock.seoMetadata.findFirst.mockResolvedValue({ id: 'seo-1' });
    prismaMock.seoMetadata.update.mockResolvedValue({
      id: 'seo-1',
      title: 'New title',
      description: 'New description',
      tags: ['tag-a', 'tag-b'],
      hashtags: ['#TagA', '#TagB'],
      seoScore: 88,
    });

    const updated = await service.updateById('seo-1', 'user-1', {
      title: ' New title ',
      description: ' New description ',
      tags: [' tag-a ', 'tag-b '],
      hashtags: [' #TagA ', ' #TagB '],
      seoScore: 88,
    });

    expect(prismaMock.seoMetadata.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'seo-1' },
        data: {
          title: 'New title',
          description: 'New description',
          tags: ['tag-a', 'tag-b'],
          hashtags: ['#TagA', '#TagB'],
          seoScore: 88,
        },
      }),
    );
    expect(updated.id).toBe('seo-1');

    prismaMock.seoMetadata.delete.mockResolvedValue(undefined);
    await service.deleteById('seo-1', 'user-1');

    expect(prismaMock.seoMetadata.delete).toHaveBeenCalledWith({
      where: { id: 'seo-1' },
    });
  });
});
