import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { VideoIdeasService } from './video-ideas.service';

describe('VideoIdeasService', () => {
  let service: VideoIdeasService;

  const prismaMock = {
    project: {
      findFirst: jest.fn(),
    },
    videoIdea: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const aiServiceMock = {
    generateVideoIdeas: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoIdeasService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AiService, useValue: aiServiceMock },
      ],
    }).compile();

    service = module.get<VideoIdeasService>(VideoIdeasService);
  });

  it('should generate and persist ideas for owned project', async () => {
    prismaMock.project.findFirst.mockResolvedValue({
      id: 'project-1',
      userId: 'user-1',
      name: 'Backend Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      description: 'Teaching backend development',
    });

    aiServiceMock.generateVideoIdeas.mockResolvedValue({
      ideas: [
        { title: 'Idea 1', hook: 'Hook 1', status: 'DRAFT' },
        { title: 'Idea 2', hook: 'Hook 2', status: 'DRAFT' },
      ],
    });

    prismaMock.$transaction.mockResolvedValue([
      { id: 'idea-1', title: 'Idea 1', hook: 'Hook 1', status: 'DRAFT' },
      { id: 'idea-2', title: 'Idea 2', hook: 'Hook 2', status: 'DRAFT' },
    ]);

    const result = await service.generateAndSave('user-1', {
      projectId: 'project-1',
      tone: 'Beginner friendly',
      count: 2,
    });

    expect(aiServiceMock.generateVideoIdeas).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'Beginner friendly', count: 2 }),
    );
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result.ideas).toHaveLength(2);
  });

  it('should throw 404 when project is not owned for generation', async () => {
    prismaMock.project.findFirst.mockResolvedValue(null);

    await expect(
      service.generateAndSave('user-1', {
        projectId: 'project-1',
        tone: 'Beginner friendly',
        count: 5,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should update and delete owned video ideas', async () => {
    prismaMock.videoIdea.findFirst.mockResolvedValue({ id: 'idea-1' });
    prismaMock.videoIdea.update.mockResolvedValue({
      id: 'idea-1',
      title: 'Updated',
      hook: 'Updated hook',
      status: 'DRAFT',
    });

    const updated = await service.updateById('idea-1', 'user-1', {
      title: ' Updated ',
      hook: ' Updated hook ',
      status: 'DRAFT',
    });

    expect(prismaMock.videoIdea.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'idea-1' },
        data: { title: 'Updated', hook: 'Updated hook', status: 'DRAFT' },
      }),
    );
    expect(updated.id).toBe('idea-1');

    prismaMock.videoIdea.delete.mockResolvedValue(undefined);
    await service.deleteById('idea-1', 'user-1');

    expect(prismaMock.videoIdea.delete).toHaveBeenCalledWith({
      where: { id: 'idea-1' },
    });
  });
});
