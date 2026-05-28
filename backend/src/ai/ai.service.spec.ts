import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { AI_PROVIDER_TOKEN } from './providers/ai-provider.token';
import { MockAiProvider } from './providers/mock-ai.provider';

describe('AiService', () => {
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        MockAiProvider,
        {
          provide: AI_PROVIDER_TOKEN,
          useClass: MockAiProvider,
        },
      ],
    }).compile();

    aiService = module.get<AiService>(AiService);
  });

  it('should return deterministic video ideas', async () => {
    const input = {
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      description: 'Teaching backend development',
      count: 3,
    };

    const first = await aiService.generateVideoIdeas(input);
    const second = await aiService.generateVideoIdeas(input);

    expect(first).toEqual(second);
    expect(first.ideas).toHaveLength(3);
    expect(first.ideas[0]?.status).toBe('DRAFT');
  });

  it('should generate script, seo, and thumbnail structures', async () => {
    const script = await aiService.generateScript({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'REST API Best Practices',
    });

    const seo = await aiService.generateSeo({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'REST API Best Practices',
    });

    const thumbnail = await aiService.generateThumbnailPrompt({
      projectName: 'Backend Developer Channel',
      niche: 'Programming',
      language: 'English',
      targetAudience: 'Junior developers',
      title: 'REST API Best Practices',
      requestedStyle: 'modern tech YouTube thumbnail',
    });

    expect(typeof script.hook).toBe('string');
    expect(typeof script.intro).toBe('string');
    expect(typeof script.mainContent).toBe('string');
    expect(typeof script.conclusion).toBe('string');
    expect(typeof script.cta).toBe('string');
    expect(typeof script.duration).toBe('string');
    expect(typeof script.tone).toBe('string');

    expect(typeof seo.title).toBe('string');
    expect(typeof seo.description).toBe('string');
    expect(Array.isArray(seo.tags)).toBe(true);
    expect(Array.isArray(seo.hashtags)).toBe(true);
    expect(typeof seo.seoScore).toBe('number');

    expect(typeof thumbnail.text).toBe('string');
    expect(typeof thumbnail.backgroundIdea).toBe('string');
    expect(typeof thumbnail.mainObject).toBe('string');
    expect(typeof thumbnail.style).toBe('string');
    expect(typeof thumbnail.prompt).toBe('string');
    expect(thumbnail.style).toContain('modern tech YouTube thumbnail');
  });
});
